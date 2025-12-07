import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth'; // Optional identifying

export async function POST(request) {
    try {
        const body = await request.json();
        const { post_id, content, author_name, author_email, honey_pot } = body;

        // 1. Spam Check: Honey Pot
        // If the hidden field is filled, it's a bot.
        if (honey_pot) {
            console.log("Spam detected: Honey pot filled.");
            // Return success to fool the bot, but don't save.
            return NextResponse.json({ success: true, message: 'Comment submitted' });
        }

        if (!content || !post_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Auth Check (Optional)
        let userId = null;
        let name = author_name;
        let email = author_email;

        const user = await verifyAuth();
        if (user) {
            userId = user.id;
            name = user.name;
            email = user.email;
        } else {
            if (!name || !email) {
                return NextResponse.json({ error: 'Name and Email are required for guests' }, { status: 400 });
            }
        }

        // 3. Spam Check: Keywords
        const spamKeywords = ['viagra', 'casino', 'buy now', 'crypto', 'bitcoin', 'http://', 'https://']; // Basic filters
        // A primitive check. Valid links might be blocked.
        // Let's block if contains keywords.
        const lowerContent = content.toLowerCase();
        const isSpam = spamKeywords.some(word => lowerContent.includes(word));

        let status = 'pending';
        if (isSpam) {
            status = 'spam';
        }

        // Insert
        await query(
            `INSERT INTO comments (post_id, user_id, author_name, author_email, content, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
            [post_id, userId, name, email, content, status]
        );

        return NextResponse.json({
            success: true,
            message: status === 'pending' ? 'Comment awaiting moderation.' : 'Comment submitted.'
        });

    } catch (error) {
        console.error('Comment submission error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// GET comments for a post
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');

    if (!postId) {
        return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    }

    const comments = await query(
        `SELECT id, user_id, author_name, content, created_at 
         FROM comments 
         WHERE post_id = ? AND status = 'approved' 
         ORDER BY created_at ASC`,
        [postId]
    );

    return NextResponse.json(comments);
}
