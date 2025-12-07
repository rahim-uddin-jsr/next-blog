import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { verifyAuth, hasRole } from '@/lib/auth';
import Link from 'next/link';
import CommentsSection from '../components/CommentsSection';

async function getPost(slug) {
    const posts = await query(`
    SELECT p.*, u.name as author_name 
    FROM posts p 
    LEFT JOIN users u ON p.author_id = u.id 
    WHERE p.slug = ?
  `, [slug]);
    return posts[0];
}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        return { title: 'Post Not Found' };
    }

    return {
        title: `${post.title} | Next.js Blog`,
        description: post.excerpt || post.content.substring(0, 160),
    };
}

export default async function BlogPostPage({ params }) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    // Check if post is public or user has permission
    const user = await verifyAuth();
    const isPublic = post.status === 'published' && new Date(post.published_at) <= new Date();
    const canViewDraft = user && (
        user.role === 'admin' ||
        user.role === 'super_admin' ||
        user.role === 'editor' ||
        user.id === post.author_id
    );

    if (!isPublic && !canViewDraft) {
        notFound(); // Or redirect to login
    }

    return (
        <div className="post-container">
            <Link href="/blog" className="back-link">← Back to Blog</Link>

            {!isPublic && (
                <div className="draft-banner">
                    ⚠️ This is a <strong>{post.status === 'published' ? 'Scheduled' : post.status}</strong> post. Only visible to you.
                </div>
            )}

            <article className="post-article">
                <header className="post-header">
                    <h1>{post.title}</h1>
                    <div className="post-meta">
                        <span className="post-author">By {post.author_name || 'Unknown'}</span>
                        <span className="post-date">
                            {new Date(post.published_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                </header>

                <div className="post-content-html">
                    {post.content.split('\n').map((paragraph, index) => (
                        paragraph.trim() && <p key={index}>{paragraph}</p>
                    ))}
                </div>
            </article>

            <CommentsSection postId={post.id} />
        </div>
    );
}
