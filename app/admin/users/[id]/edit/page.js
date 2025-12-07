import { notFound, redirect } from 'next/navigation';
import { verifyAuth, hasRole } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import { query } from '@/lib/db';
import UserForm from '../../components/UserForm';

async function getUser(id) {
    const users = await query('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
    return users[0];
}

export default async function EditUserPage({ params }) {
    const user = await verifyAuth();

    if (!user || !hasRole(user.role, 'admin')) {
        redirect('/auth/login?redirect=/admin/users');
    }

    const { id } = await params;
    const targetUser = await getUser(id);

    if (!targetUser) {
        notFound();
    }

    return (
        <AdminLayout user={user}>
            <div className="page-header">
                <h1>Edit User</h1>
            </div>
            <div className="max-w-4xl mx-auto">
                <UserForm initialData={targetUser} currentUserId={user.id} />
            </div>
        </AdminLayout>
    );
}
