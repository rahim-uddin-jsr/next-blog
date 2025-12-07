import { redirect } from 'next/navigation';
import { verifyAuth, hasRole } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import PostForm from '../components/PostForm';

export default async function NewPostPage() {
    const user = await verifyAuth();

    if (!user || !hasRole(user.role, 'editor')) {
        redirect('/auth/login?redirect=/admin/posts/new');
    }

    return (
        <AdminLayout user={user}>
            <div className="page-header">
                <h1>Create New Post</h1>
            </div>
            <div className="max-w-4xl mx-auto">
                <PostForm />
            </div>
        </AdminLayout>
    );
}
