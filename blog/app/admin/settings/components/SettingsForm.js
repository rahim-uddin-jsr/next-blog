'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [settings, setSettings] = useState({
        site_name: '',
        site_description: '',
        footer_text: '',
        posts_per_page: '10',
        contact_email: '',
        enable_comments: 'true'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? String(checked) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Settings saved successfully' });
                router.refresh();
            } else {
                setMessage({ type: 'error', text: 'Failed to save settings' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4">Loading settings...</div>;

    return (
        <form onSubmit={handleSubmit} className="card max-w-4xl">
            {message.text && (
                <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="form-group">
                <label>Site Name</label>
                <input
                    type="text"
                    name="site_name"
                    value={settings.site_name}
                    onChange={handleChange}
                    className="form-input"
                />
            </div>

            <div className="form-group">
                <label>Site Description</label>
                <textarea
                    name="site_description"
                    value={settings.site_description}
                    onChange={handleChange}
                    className="form-input"
                    rows="3"
                />
            </div>

            <div className="grid-layout-2col gap-4">
                <div className="form-group">
                    <label>Contact Email</label>
                    <input
                        type="email"
                        name="contact_email"
                        value={settings.contact_email}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>Posts Per Page</label>
                    <input
                        type="number"
                        name="posts_per_page"
                        value={settings.posts_per_page}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Blogging Preferences</label>
                <div className="checkbox-item mt-2">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            name="enable_comments"
                            checked={settings.enable_comments === 'true'}
                            onChange={(e) => setSettings({ ...settings, enable_comments: String(e.target.checked) })}
                        />
                        <span>Enable Comments on Posts</span>
                    </label>
                </div>
            </div>

            <div className="form-group">
                <label>Footer Text</label>
                <input
                    type="text"
                    name="footer_text"
                    value={settings.footer_text}
                    onChange={handleChange}
                    className="form-input"
                />
            </div>

            <div className="form-actions">
                <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>
        </form>
    );
}
