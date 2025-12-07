export const dynamic = "force-dynamic";
import Link from 'next/link';
import { query } from '@/lib/db';

async function getPublishedPosts() {
    const posts = await query(`
    SELECT p.*, u.name as author_name 
    FROM posts p 
    LEFT JOIN users u ON p.author_id = u.id 
    WHERE p.status = 'published' AND p.published_at <= NOW()
    ORDER BY p.published_at DESC
  `);
    return posts;
}

export default async function BlogIndexPage() {
    const posts = await getPublishedPosts();

    return (
        <div className="blog-container">
            <header className="blog-header">
                <h1>Latest Articles</h1>
                <p>Explore our collection of thoughts and tutorials.</p>
            </header>

            <div className="posts-grid">
                {posts.length === 0 ? (
                    <p className="no-posts">No posts published yet. Check back soon!</p>
                ) : (
                    posts.map((post) => (
                        <article key={post.id} className="post-card">
                            <Link href={`/blog/${post.slug}`}>
                                <div className="post-content">
                                    <h2>{post.title}</h2>
                                    <div className="post-meta">
                                        <span>{post.author_name}</span>
                                        <span>•</span>
                                        <span>{new Date(post.published_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="post-excerpt">
                                        {post.excerpt || post.content.substring(0, 150) + '...'}
                                    </p>
                                    <span className="read-more">Read more →</span>
                                </div>
                            </Link>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}
