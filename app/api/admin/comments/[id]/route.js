import { NextResponse } from 'next/server';
import { verifyAuth, canManagePosts } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PUT(request, { params }) {
    try {
        const user = await verifyAuth();
        if (!user || user.role === 'user') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const { status } = await request.json();

        if (!['approved', 'pending', 'spam'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await query('UPDATE comments SET status = ? WHERE id = ?', [status, id]);

        return NextResponse.json({ success: true });

    } catch (error) {
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
        await query('DELETE FROM comments WHERE id = ?', [id]);

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
