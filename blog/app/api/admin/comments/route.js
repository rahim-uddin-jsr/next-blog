import { NextResponse } from 'next/server';
import { verifyAuth, canManagePosts } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const user = await verifyAuth();
        if (!user || !canManagePosts(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Fetch all comments with post title
        const comments = await query(`
        SELECT c.*, p.title as post_title 
        FROM comments c
        LEFT JOIN posts p ON c.post_id = p.id
        ORDER BY c.created_at DESC
    `);

        return NextResponse.json(comments);

    } catch (error) {
        console.error('Get comments error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
