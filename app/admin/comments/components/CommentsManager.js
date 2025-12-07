'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'GU';
const getRandomColor = (name) => {
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

export default function CommentsManager({ initialComments }) {
    const router = useRouter();
    const [comments, setComments] = useState(initialComments);
    const [filter, setFilter] = useState('pending');

    const filteredComments = comments.filter(c => filter === 'all' || c.status === filter);

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/admin/comments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setComments(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
                router.refresh();
            }
        } catch (err) { console.error(err); }
    };

    const deleteComment = async (id) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;
        try {
            const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setComments(prev => prev.filter(c => c.id !== id));
                router.refresh();
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div>
            {/* Tabs */}
            <div className="comments-filter-tabs">
                {['pending', 'approved', 'spam', 'all'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`tab-btn ${filter === status ? 'active' : ''}`}
                    >
                        <span style={{ textTransform: 'capitalize' }}>{status}</span>
                        <span className="tab-count">
                            {comments.filter(c => status === 'all' || c.status === status).length}
                        </span>
                    </button>
                ))}
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Author</th>
                                <th style={{ width: '35%' }}>Comment</th>
                                <th>Post</th>
                                <th>Date</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredComments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                        No comments found in this section.
                                    </td>
                                </tr>
                            ) : (
                                filteredComments.map(comment => {
                                    const authorName = comment.author_name || 'Guest';
                                    const initials = getInitials(authorName);
                                    const color = getRandomColor(authorName);

                                    return (
                                        <tr key={comment.id}>
                                            <td>
                                                <div className="author-cell">
                                                    <div className="avatar" style={{ backgroundColor: color }}>
                                                        {initials}
                                                    </div>
                                                    <div className="author-info">
                                                        <div>{authorName}</div>
                                                        <div>{comment.author_email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="comment-preview">{comment.content}</div>
                                                <span className={`comment-status-pill status-${comment.status}`}>
                                                    {comment.status}
                                                </span>
                                            </td>
                                            <td>
                                                {comment.post_title}
                                            </td>
                                            <td>
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div className="table-actions">
                                                    {comment.status !== 'approved' && (
                                                        <button
                                                            onClick={() => updateStatus(comment.id, 'approved')}
                                                            className="btn-action"
                                                            title="Approve"
                                                            style={{ color: 'var(--success-color, #10b981)' }}
                                                        >
                                                            ✅
                                                        </button>
                                                    )}
                                                    {comment.status !== 'spam' && (
                                                        <button
                                                            onClick={() => updateStatus(comment.id, 'spam')}
                                                            className="btn-action"
                                                            title="Mark as Spam"
                                                            style={{ color: 'var(--warning-color, #f59e0b)' }}
                                                        >
                                                            🚫
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteComment(comment.id)}
                                                        className="btn-action"
                                                        title="Delete"
                                                        style={{ color: 'var(--danger-color, #ef4444)' }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
