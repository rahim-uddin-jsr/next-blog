'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoryForm() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            if (res.ok) {
                setName('');
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to create');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <div className="form-group">
                <label>Name</label>
                <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Technology"
                />
            </div>
            {error && <p className="error-message mb-4">{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? 'Adding...' : 'Add Category'}
            </button>
        </form>
    );
}
