'use client';

import { useState, useEffect } from 'react';

const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : 'GU';
};

const getRandomColor = (name) => {
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function CommentsSection({ postId }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ author_name: '', author_email: '', content: '', honey_pot: '' });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?post_id=${postId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, post_id: postId })
            });

            const data = await res.json();
            if (res.ok) {
                if (data.success) {
                    setMessage('Thanks! Your comment has been submitted for review.');
                    setFormData({ author_name: '', author_email: '', content: '', honey_pot: '' });
                }
            } else {
                setMessage(data.error || 'Failed to submit');
            }
        } catch (err) {
            setMessage('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="comments-container">
            <h3 className="comments-title">
                💬 Comments
                <span className="comments-count">({comments.length})</span>
            </h3>

            {/* Comment List */}
            <div className="comment-list">
                {loading ? (
                    <p className="text-secondary">Loading comments...</p>
                ) : comments.length === 0 ? (
                    <div className="comment-empty">
                        <p>No comments yet.</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    comments.map(comment => {
                        const initials = getInitials(comment.author_name || 'Guest');
                        const bgColor = getRandomColor(comment.author_name || 'Guest');

                        return (
                            <div key={comment.id} className="comment-item">
                                <div
                                    className="avatar"
                                    style={{ backgroundColor: bgColor }}
                                >
                                    {initials}
                                </div>
                                <div className="comment-body">
                                    <div className="comment-header">
                                        <h5 className="comment-author">{comment.author_name || 'Guest'}</h5>
                                        <span className="comment-date">
                                            {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="comment-content">
                                        {comment.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Comment Form */}
            <div className="comment-form-card">
                <h4>Leave a Reply</h4>

                {message && (
                    <div className={`alert-message ${message.includes('Thanks') ? 'alert-success' : 'alert-error'}`}>
                        <span>{message.includes('Thanks') ? '🎉' : '⚠️'}</span>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Honey Pot */}
                    <input type="text" name="honey_pot" style={{ display: 'none' }} value={formData.honey_pot} onChange={(e) => setFormData({ ...formData, honey_pot: e.target.value })} tabIndex="-1" autoComplete="off" />

                    <div className="form-row-2">
                        <div>
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="John Doe"
                                value={formData.author_name}
                                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">Email <span>(Private)</span></label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="john@example.com"
                                value={formData.author_email}
                                onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Message</label>
                        <textarea
                            className="form-input"
                            style={{ minHeight: '120px', resize: 'vertical' }}
                            placeholder="Share your thoughts..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-submit"
                    >
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            </div>
        </section>
    );
}
