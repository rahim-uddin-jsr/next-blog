import { NextResponse } from 'next/server';
import { verifyAuth, canManagePosts } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request) {
    try {
        const user = await verifyAuth();
        if (!user || !canManagePosts(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { title, slug, excerpt, content, status, category_ids, published_at } = body;

        // Validation
        if (!title || !slug) {
            return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
        }

        const existing = await query('SELECT id FROM posts WHERE slug = ?', [slug]);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
        }

        // Use supplied date or current time
        const publishDate = published_at || new Date(); // Need to format for MySQL? 'mysql2' usually handles Date objects.
        // It's safer to use ISO string or ensuring it matches DATETIME format if manual concatenation. 
        // But parameterized query handles Date objects fine usually.

        const result = await query(
            `INSERT INTO posts (title, slug, excerpt, content, status, published_at, author_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, slug, excerpt, content, status, publishDate, user.id]
        );

        const postId = result.insertId;

        if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
            const values = category_ids.map(id => `(${postId}, ${parseInt(id)})`).join(',');
            await query(`INSERT INTO post_categories (post_id, category_id) VALUES ${values}`);
        }

        await query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) 
             VALUES (?, ?, ?, ?, ?)`,
            [user.id, 'create_post', 'post', postId, `Created post: ${title}`]
        );

        return NextResponse.json({ success: true, id: postId });

    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
