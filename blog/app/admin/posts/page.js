import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyAuth, hasRole } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import { query } from '@/lib/db';
import DeletePostButton from './components/DeletePostButton';

async function getPosts() {
    const posts = await query(`
    SELECT p.*, u.name as author_name 
    FROM posts p 
    LEFT JOIN users u ON p.author_id = u.id 
    ORDER BY p.created_at DESC
  `);
    return posts;
}

export default async function PostsPage() {
    const user = await verifyAuth();

    if (!user || !hasRole(user.role, 'editor')) {
        redirect('/auth/login?redirect=/admin/posts');
    }

    const posts = await getPosts();

    return (
        <AdminLayout user={user}>
            <div className="page-header">
                <h1>Manage Posts</h1>
                <Link href="/admin/posts/new" className="btn btn-primary">
                    + New Post
                </Link>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center">No posts found. Create one!</td>
                                </tr>
                            ) : (
                                posts.map((post) => (
                                    <tr key={post.id}>
                                        <td>
                                            <div className="post-title">{post.title}</div>
                                            <div className="post-slug">/{post.slug}</div>
                                        </td>
                                        <td>{post.author_name || 'Unknown'}</td>
                                        <td>
                                            <span className={`status-badge status-${post.status}`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td>{new Date(post.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link href={`/admin/posts/${post.id}/edit`} className="btn-icon" title="Edit">
                                                    ✏️
                                                </Link>
                                                <DeletePostButton postId={post.id} />
                                                <Link href={`/blog/${post.slug}`} target="_blank" className="btn-icon" title="View">
                                                    👁️
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
