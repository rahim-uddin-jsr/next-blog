import { NextResponse } from 'next/server';

export async function POST(request) {
    // Redirect to homepage after logout
    const response = NextResponse.redirect(new URL('/', request.url), {
        status: 303, // See Other
    });

    // Clear the auth cookie
    response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0
    });

    return response;
}

