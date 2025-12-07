import { NextResponse } from 'next/server';
import { verifyAuth, hasRole } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const user = await verifyAuth();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Return flattened list, frontend handles hierarchy
        const categories = await query('SELECT * FROM categories ORDER BY name ASC');
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const user = await verifyAuth();
        if (!user || user.role === 'user') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { name, slug, parent_id } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const finalSlug = slug || name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
        const parentVal = parent_id ? parseInt(parent_id) : null;

        const result = await query(
            'INSERT INTO categories (name, slug, parent_id) VALUES (?, ?, ?)',
            [name, finalSlug, parentVal]
        );

        await query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) 
       VALUES (?, ?, ?, ?, ?)`,
            [user.id, 'create_category', 'category', result.insertId, `Created category: ${name}`]
        );

        return NextResponse.json({ id: result.insertId, name, slug: finalSlug, parent_id: parentVal });

    } catch (error) {
        console.error('Create category error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ error: 'Category already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
