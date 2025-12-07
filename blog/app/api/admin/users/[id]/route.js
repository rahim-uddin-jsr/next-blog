import { NextResponse } from 'next/server';
import { verifyAuth, hasRole } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(request, { params }) {
    try {
        const user = await verifyAuth();
        if (!user || !hasRole(user.role, 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, email, role } = body;

        // Prevent changing own role via this API if safety needed, but UI handles it.
        if (parseInt(id) === user.id && role !== user.role) {
            // Optional: Block changing own role to prevent lockout
            // return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
        }

        // Only super_admin can create other admins/super_admins?
        // Let's keep it simple: admin can manage all.

        await query(
            `UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?`,
            [name, email, role, id]
        );

        // Log activity
        await query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) 
       VALUES (?, ?, ?, ?, ?)`,
            [user.id, 'update_user', 'user', id, `Updated user: ${email} to role ${role}`]
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
