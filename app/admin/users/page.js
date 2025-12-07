export const dynamic = "force-dynamic";

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyAuth, hasRole } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import { query } from '@/lib/db';
import DeleteUserButton from './components/DeleteUserButton';

async function getUsers() {
    const users = await query(`
    SELECT id, name, email, role, created_at 
    FROM users 
    ORDER BY created_at DESC
  `);
    return users;
}

export default async function UsersPage() {
    const user = await verifyAuth();

    if (!user || !hasRole(user.role, 'admin')) {
        redirect('/auth/login?redirect=/admin/users');
    }

    const users = await getUsers();

    return (
        <AdminLayout user={user}>
            <div className="page-header">
                <h1>Manage Users</h1>
                <Link href="/admin/users/new" className="btn btn-primary">
                    + New User
                </Link>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Join Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td>#{u.id}</td>
                                    <td>
                                        <div className="font-weight-bold">{u.name}</div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`role-badge role-${u.role}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <Link href={`/admin/users/${u.id}/edit`} className="btn-icon" title="Edit">
                                                ✏️
                                            </Link>
                                            <DeleteUserButton
                                                userId={u.id}
                                                userName={u.name}
                                                isSelf={user.id === u.id}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
