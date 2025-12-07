import { NextResponse } from 'next/server';
import { verifyAuth, canManagePosts } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
    try {
        const user = await verifyAuth();
        if (!user || !canManagePosts(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        // Get post info for logging
        const posts = await query('SELECT title FROM posts WHERE id =?', [id]);
        const postTitle = posts[0]?.title || 'Unknown';

        await query('DELETE FROM posts WHERE id = ?', [id]);

        // Log activity
        await query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) 
       VALUES (?, ?, ?, ?, ?)`,
            [user.id, 'delete_post', 'post', id, `Deleted post: ${postTitle}`]
        );

        // Redirect back to list
        return NextResponse.redirect(new URL('/admin/posts', request.url), {
            status: 303,
        });

    } catch (error) {
        console.error('Delete post error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
