export const dynamic = "force-dynamic";

import { redirect } from 'next/navigation';
import { verifyAuth, hasRole } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import { query } from '@/lib/db';
import CommentsManager from './components/CommentsManager';

async function getComments() {
    // Join posts to get title
    return await query(`
        SELECT c.*, p.title as post_title 
        FROM comments c
        LEFT JOIN posts p ON c.post_id = p.id
        ORDER BY c.created_at DESC
    `);
}

export default async function CommentsPage() {
    const user = await verifyAuth();

    if (!user || user.role === 'user') {
        redirect('/auth/login?redirect=/admin/comments');
    }

    const comments = await getComments();

    return (
        <AdminLayout user={user}>
            <div className="page-header">
                <h1>Comments</h1>
            </div>
            <CommentsManager initialComments={comments} />
        </AdminLayout>
    );
}
