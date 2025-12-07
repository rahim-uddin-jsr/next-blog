import { notFound, redirect } from 'next/navigation';
import { verifyAuth, hasRole } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import { query } from '@/lib/db';
import PostForm from '../../components/PostForm';

async function getPost(id) {
    const posts = await query('SELECT * FROM posts WHERE id = ?', [id]);

    if (posts.length === 0) return null;
    const post = posts[0];

    const categories = await query('SELECT category_id FROM post_categories WHERE post_id = ?', [id]);
    post.categories = categories.map(c => c.category_id);

    return post;
}

export default async function EditPostPage({ params }) {
    const user = await verifyAuth();

    if (!user || !hasRole(user.role, 'editor')) {
        redirect('/auth/login?redirect=/admin/posts');
    }

    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        notFound();
    }

    return (
        <AdminLayout user={user}>
            <div className="page-header">
                <h1>Edit Post</h1>
            </div>
            <div className="max-w-5xl mx-auto">
                <PostForm initialData={post} />
            </div>
        </AdminLayout>
    );
}
