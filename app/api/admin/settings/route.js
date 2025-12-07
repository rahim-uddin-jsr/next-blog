import { NextResponse } from 'next/server';
import { verifyAuth, hasRole } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const user = await verifyAuth();
        if (!user || user.role === 'user') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const rows = await query('SELECT setting_key, setting_value FROM settings');
        const settings = rows.reduce((acc, row) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Get settings error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const user = await verifyAuth();
        if (!user || user.role !== 'super_admin' && user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();

        // Iterate and update
        for (const [key, value] of Object.entries(body)) {
            // Sanitize? Typically safe as parametrized.
            // Maybe restrict keys if strict schema needed.
            await query(
                'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, String(value), String(value)]
            );
        }

        await query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) 
         VALUES (?, ?, ?, ?, ?)`,
            [user.id, 'update_settings', 'system', 0, 'Updated system settings']
        );

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update settings error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
