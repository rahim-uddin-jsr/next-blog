import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request) {
    try {
        const { email, password, name } = await request.json();

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUsers = await query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user
        const result = await query(
            'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
            [email, passwordHash, name || null]
        );

        return NextResponse.json(
            { message: 'User created successfully', userId: result.insertId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
