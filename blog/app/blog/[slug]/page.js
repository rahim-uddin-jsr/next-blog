import { getPostBySlug, getAllPostSlugs } from '@/lib/posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateStaticParams() {
    const slugs = getAllPostSlugs();
    return slugs.map((slug) => ({
        slug: slug,
    }));
}

export default async function BlogPost({ params }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="post-container">
            <Link href="/blog" className="back-link">
                ← Back to Blog
            </Link>

            <article className="post-article">
                <header className="post-header">
                    <h1>{post.title}</h1>
                    <div className="post-meta">
                        <span className="post-author">By {post.author}</span>
                        <span className="post-date">{post.date}</span>
                    </div>
                </header>

                <div
                    className="post-content-html"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>
        </div>
    );
}
