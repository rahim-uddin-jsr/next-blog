import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { query } from './db';

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

        // Get user with role from database
        const users = await query(
            'SELECT id, email, name, role FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return null;
        }

        return users[0];
    } catch (error) {
        console.error('Auth verification error:', error);
        return null;
    }
}

export async function requireAuth(requiredRole = null) {
    const user = await verifyAuth();

    if (!user) {
        throw new Error('Unauthorized');
    }

    if (requiredRole && !hasRole(user.role, requiredRole)) {
        throw new Error('Forbidden - Insufficient permissions');
    }

    return user;
}

// Role hierarchy: user < editor < admin < super_admin
const roleHierarchy = {
    'user': 0,
    'editor': 1,
    'admin': 2,
    'super_admin': 3
};

export function hasRole(userRole, requiredRole) {
    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    return userLevel >= requiredLevel;
}

export function canManagePosts(userRole) {
    return hasRole(userRole, 'editor');
}

export function canManageUsers(userRole) {
    return hasRole(userRole, 'admin');
}

export function canManageSettings(userRole) {
    return hasRole(userRole, 'super_admin');
}
