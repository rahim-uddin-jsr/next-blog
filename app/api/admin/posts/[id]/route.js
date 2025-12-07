import { NextResponse } from 'next/server';
import { verifyAuth, canManagePosts } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(request, { params }) {
    try {
        const user = await verifyAuth();
        if (!user || !canManagePosts(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, slug, excerpt, content, status, category_ids, published_at } = body;

        // Check slug uniqueness (excluding self)
        const existing = await query('SELECT id FROM posts WHERE slug = ? AND id != ?', [slug, id]);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Slug must be unique' }, { status: 400 });
        }

        // Update post
        await query(
            `UPDATE posts 
       SET title = ?, slug = ?, excerpt = ?, content = ?, status = ?, published_at = ?
       WHERE id = ?`,
            [title, slug, excerpt, content, status, published_at, id]
        );

        // Update categories (Delete all then insert new)
        await query('DELETE FROM post_categories WHERE post_id = ?', [id]);

        if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
            const values = category_ids.map(catId => `(${id}, ${parseInt(catId)})`).join(',');
            await query(`INSERT INTO post_categories (post_id, category_id) VALUES ${values}`);
        }

        // Activity log
        await query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) 
       VALUES (?, ?, ?, ?, ?)`,
            [user.id, 'update_post', 'post', id, `Updated post: ${title}`]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update post error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
