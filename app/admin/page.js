export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import { query } from '@/lib/db';

export default async function AdminDashboard() {
    const user = await verifyAuth();

    if (!user) {
        redirect('/auth/login?redirect=/admin');
    }

    if (user.role === 'user') {
        redirect('/?error=unauthorized');
    }

    // Get dashboard statistics
    const stats = await getDashboardStats();

    return (
        <AdminLayout user={user}>
            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                        <h3>Total Posts</h3>
                        <p className="stat-number">{stats.totalPosts}</p>
                        <span className="stat-label">{stats.publishedPosts} published</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <h3>Total Users</h3>
                        <p className="stat-number">{stats.totalUsers}</p>
                        <span className="stat-label">{stats.newUsers} this month</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💬</div>
                    <div className="stat-content">
                        <h3>Comments</h3>
                        <p className="stat-number">{stats.totalComments}</p>
                        <span className="stat-label">{stats.pendingComments} pending</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🏷️</div>
                    <div className="stat-content">
                        <h3>Categories</h3>
                        <p className="stat-number">{stats.totalCategories}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-sections">
                <section className="recent-activity">
                    <h2>Recent Activity</h2>
                    <div className="activity-list">
                        {stats.recentActivity.length === 0 ? (
                            <p className="empty-state">No recent activity</p>
                        ) : (
                            stats.recentActivity.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    <span className="activity-time">{formatDate(activity.created_at)}</span>
                                    <span className="activity-text">{activity.action}</span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <a href="/admin/posts/new" className="action-btn">
                            <span>📝</span> New Post
                        </a>
                        <a href="/admin/categories" className="action-btn">
                            <span>🏷️</span> Manage Categories
                        </a>
                        <a href="/admin/users" className="action-btn">
                            <span>👥</span> Manage Users
                        </a>
                        <a href="/admin/comments" className="action-btn">
                            <span>💬</span> Review Comments
                        </a>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}

async function getDashboardStats() {
    try {
        const [postsResult] = await Promise.all([
            query('SELECT COUNT(*) as total, SUM(CASE WHEN status = "published" THEN 1 ELSE 0 END) as published FROM posts'),
        ]);

        const [usersResult] = await Promise.all([
            query('SELECT COUNT(*) as total FROM users'),
        ]);

        const [commentsResult] = await Promise.all([
            query('SELECT COUNT(*) as total, SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending FROM comments'),
        ]);

        const [categoriesResult] = await Promise.all([
            query('SELECT COUNT(*) as total FROM categories'),
        ]);

        const [activityResult] = await Promise.all([
            query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10'),
        ]);

        return {
            totalPosts: postsResult[0]?.total || 0,
            publishedPosts: postsResult[0]?.published || 0,
            totalUsers: usersResult[0]?.total || 0,
            newUsers: 0, // Calculate based on date
            totalComments: commentsResult[0]?.total || 0,
            pendingComments: commentsResult[0]?.pending || 0,
            totalCategories: categoriesResult[0]?.total || 0,
            recentActivity: activityResult || [],
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            totalPosts: 0,
            publishedPosts: 0,
            totalUsers: 0,
            newUsers: 0,
            totalComments: 0,
            pendingComments: 0,
            totalCategories: 0,
            recentActivity: [],
        };
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}
