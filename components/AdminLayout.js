'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children, user }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: '📊', roles: ['editor', 'admin', 'super_admin'] },
        { name: 'Posts', path: '/admin/posts', icon: '📝', roles: ['editor', 'admin', 'super_admin'] },
        { name: 'Categories', path: '/admin/categories', icon: '🏷️', roles: ['editor', 'admin', 'super_admin'] },
        { name: 'Comments', path: '/admin/comments', icon: '💬', roles: ['editor', 'admin', 'super_admin'] },
        { name: 'Users', path: '/admin/users', icon: '👥', roles: ['admin', 'super_admin'] },
        { name: 'Settings', path: '/admin/settings', icon: '⚙️', roles: ['admin', 'super_admin'] },
        { name: 'Activity Logs', path: '/admin/logs', icon: '📋', roles: ['admin', 'super_admin'] },
    ];

    const roleHierarchy = { 'user': 0, 'editor': 1, 'admin': 2, 'super_admin': 3 };
    const userLevel = roleHierarchy[user?.role] || 0;

    const filteredMenu = menuItems.filter(item => {
        const minLevel = Math.min(...item.roles.map(r => roleHierarchy[r] || 0));
        return userLevel >= minLevel;
    });

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? '←' : '→'}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {filteredMenu.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                            onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="nav-label">{item.name}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        {sidebarOpen && (
                            <>
                                <div className="user-name">{user?.name || user?.email}</div>
                                <div className="user-role">{user?.role}</div>
                            </>
                        )}
                    </div>
                    <Link href="/" className="btn-back">
                        {sidebarOpen ? '← Back to Site' : '←'}
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <button
                        className="mobile-toggle-btn"
                        onClick={() => setSidebarOpen(true)}
                        style={{
                            display: 'none',
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            marginRight: '1rem',
                            color: 'var(--text-primary)'
                        }}
                    >
                        ☰
                    </button>
                    <h1>Admin Dashboard</h1>
                    <div className="header-actions">
                        <span className="user-badge">{user?.role}</span>
                        <form action="/api/auth/logout" method="POST">
                            <button type="submit" className="btn-logout">Logout</button>
                        </form>
                    </div>
                </header>

                <div className="admin-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
