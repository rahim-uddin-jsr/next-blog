import { NextResponse } from 'next/server';
import { verifyAuth, hasRole } from '@/lib/auth';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const user = await verifyAuth();
        if (!user || !hasRole(user.role, 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check email uniqueness
        const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const result = await query(
            `INSERT INTO users (name, email, password_hash, role) 
       VALUES (?, ?, ?, ?)`,
            [name, email, passwordHash, role]
        );

        // Log activity
        await query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) 
       VALUES (?, ?, ?, ?, ?)`,
            [user.id, 'create_user', 'user', result.insertId, `Created user: ${email} as ${role}`]
        );

        return NextResponse.json({
            success: true,
            id: result.insertId
        });

    } catch (error) {
        console.error('Create user error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
