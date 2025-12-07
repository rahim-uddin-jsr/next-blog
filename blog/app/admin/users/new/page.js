import { redirect } from 'next/navigation';
import { verifyAuth, hasRole } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import CreateUserForm from '../components/CreateUserForm';

export default async function NewUserPage() {
    const user = await verifyAuth();

    if (!user || !hasRole(user.role, 'admin')) {
        redirect('/auth/login?redirect=/admin/users/new');
    }

    return (
        <AdminLayout user={user}>
            <div className="page-header">
                <h1>Add New User</h1>
            </div>
            <div className="max-w-4xl mx-auto">
                <CreateUserForm />
            </div>
        </AdminLayout>
    );
}
