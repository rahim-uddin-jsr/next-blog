import { NextResponse } from 'next/server';
import { verifyAuth, hasRole } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(request, { params }) {
    try {
        const user = await verifyAuth();
        if (!user || user.role === 'user') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, slug, parent_id } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const finalSlug = slug || name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
        const parentVal = parent_id ? parseInt(parent_id) : null;

        // Prevent parent being self or child of self (circular)
        if (parentVal === parseInt(id)) {
            return NextResponse.json({ error: 'Cannot be own parent' }, { status: 400 });
        }

        await query(
            'UPDATE categories SET name = ?, slug = ?, parent_id = ? WHERE id = ?',
            [name, finalSlug, parentVal, id]
        );

        // Logging
        await query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) 
       VALUES (?, ?, ?, ?, ?)`,
            [user.id, 'update_category', 'category', id, `Updated category: ${name}`]
        );

        return NextResponse.json({ success: true, id, name, slug: finalSlug, parent_id: parentVal });

    } catch (error) {
        console.error('Update category error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const user = await verifyAuth();
        if (!user || user.role === 'user') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        await query('DELETE FROM categories WHERE id = ?', [id]);

        await query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) 
       VALUES (?, ?, ?, ?, ?)`,
            [user.id, 'delete_category', 'category', id, 'Deleted category']
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete category error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
