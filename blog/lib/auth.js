import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function verifyAuth() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'fallback-secret'
        );

        return decoded;
    } catch (error) {
        console.error('Auth verification error:', error);
        return null;
    }
}

export async function requireAuth() {
    const user = await verifyAuth();

    if (!user) {
        throw new Error('Unauthorized');
    }

    return user;
}
