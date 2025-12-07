import { NextResponse } from 'next/server';
import { verifyAuth, hasRole } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request, { params }) {
    try {
        const user = await verifyAuth();
        if (!user || !hasRole(user.role, 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        // Prevent deleting self
        if (parseInt(id) === user.id) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        // Get user info for logging
        const targetUser = await query('SELECT email FROM users WHERE id =?', [id]);
        const userEmail = targetUser[0]?.email || 'Unknown';

        await query('DELETE FROM users WHERE id = ?', [id]);

        // Log activity
        await query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) 
       VALUES (?, ?, ?, ?, ?)`,
            [user.id, 'delete_user', 'user', id, `Deleted user: ${userEmail}`]
        );

        // Redirect back to list
        return NextResponse.redirect(new URL('/admin/users', request.url), {
            status: 303,
        });

    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
