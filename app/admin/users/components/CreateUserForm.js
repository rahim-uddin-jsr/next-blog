'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateUserForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create user');
            }

            router.push('/admin/users');
            router.refresh();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

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
                    placeholder="John Doe"
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
                    placeholder="user@example.com"
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="form-input"
                    minLength={6}
                />
            </div>

            <div className="form-group">
                <label>Role</label>
                <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="form-input"
                >
                    <option value="user">User</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
            </div>

            <div className="form-actions">
                <button type="button" onClick={() => router.back()} className="btn btn-secondary">
                    Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Creating...' : 'Create User'}
                </button>
            </div>
        </form>
    );
}
