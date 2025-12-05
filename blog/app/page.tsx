import Link from "next/link";

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-hero">
        <h1 className="home-title">Welcome to Our Blog</h1>
        <p className="home-subtitle">
          Discover insightful articles on web development, design, and technology
        </p>

        <div className="home-actions">
          <Link href="/blog" className="btn btn-primary">
            Explore Blog
          </Link>
          <Link href="/auth/login" className="btn btn-secondary">
            Login
          </Link>
        </div>
      </div>

      <div className="home-features">
        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3>Quality Content</h3>
          <p>In-depth articles and tutorials on modern web development</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Secure Authentication</h3>
          <p>MySQL-backed authentication with JWT tokens</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Fast & Modern</h3>
          <p>Built with Next.js for optimal performance</p>
        </div>
      </div>
    </div>
  );
}
