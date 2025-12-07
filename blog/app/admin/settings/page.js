import { redirect } from 'next/navigation';
import { verifyAuth, hasRole } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import SettingsForm from './components/SettingsForm';

export default async function SettingsPage() {
    const user = await verifyAuth();

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        redirect('/auth/login?redirect=/admin/settings');
    }

    return (
        <AdminLayout user={user}>
            <div className="page-header">
                <h1>General Settings</h1>
            </div>
            <SettingsForm />
        </AdminLayout>
    );
}
