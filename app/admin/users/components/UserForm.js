'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserForm({ initialData, currentUserId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        role: initialData?.role || 'user',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = `/api/admin/users/${initialData.id}`;
            const method = 'PUT';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update user');
            }

            router.push('/admin/users');
            router.refresh();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Prevent editing own role to avoid locking oneself out (optional safety)
    const isEditingSelf = initialData.id === currentUserId;

    return (
        <form onSubmit={handleSubmit} className="card">
            {error && <div className="error-message mb-4">{error}</div>}

            <div className="form-group">
                <label>Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label>Role</label>
                <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="form-input"
                    disabled={isEditingSelf} // Safety: Don't change your own role
                >
                    <option value="user">User</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
                {isEditingSelf && <small className="text-secondary">You cannot change your own role.</small>}
            </div>

            <div className="form-actions">
                <button type="button" onClick={() => router.back()} className="btn btn-secondary">
                    Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Saving...' : 'Update User'}
                </button>
            </div>
        </form>
    );
}
