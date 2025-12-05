import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export default function BlogPage() {
    const posts = getAllPosts();

    return (
        <div className="blog-container">
            <header className="blog-header">
                <h1>Blog</h1>
                <p>Thoughts, tutorials, and insights on web development</p>
            </header>

            <div className="posts-grid">
                {posts.length === 0 ? (
                    <p className="no-posts">No posts available yet.</p>
                ) : (
                    posts.map((post) => (
                        <article key={post.slug} className="post-card">
                            <Link href={`/blog/${post.slug}`}>
                                <div className="post-content">
                                    <h2>{post.title}</h2>
                                    <div className="post-meta">
                                        <span className="post-author">{post.author}</span>
                                        <span className="post-date">{post.date}</span>
                                    </div>
                                    <p className="post-excerpt">{post.excerpt}</p>
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
