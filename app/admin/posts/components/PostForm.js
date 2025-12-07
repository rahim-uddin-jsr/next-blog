'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-md" />
});

export default function PostForm({ initialData = null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Categories State
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryParent, setNewCategoryParent] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    const [origin, setOrigin] = useState('');

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        excerpt: initialData?.excerpt || '',
        content: initialData?.content || '',
        status: initialData?.status || 'draft',
        published_at: initialData?.published_at || new Date().toISOString(),
    });

    useEffect(() => {
        setOrigin(window.location.origin);
        fetchCategories();

        if (initialData?.categories) {
            const ids = initialData.categories.map(c => typeof c === 'object' ? c.id : c);
            setSelectedCategories(ids);
        }
    }, [initialData]);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        setIsAddingCategory(true);
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newCategoryName,
                    parent_id: newCategoryParent || null
                })
            });

            if (res.ok) {
                const newCat = await res.json();
                setCategories(prev => [...prev, newCat]);
                setSelectedCategories(prev => [...prev, newCat.id]);
                setNewCategoryName('');
                setNewCategoryParent('');
            } else {
                alert('Failed to create category');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsAddingCategory(false);
        }
    };

    const toggleCategory = (id) => {
        setSelectedCategories(prev =>
            prev.includes(id)
                ? prev.filter(cId => cId !== id)
                : [...prev, id]
        );
    };

    const generateSlug = (title) => {
        return title.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: generateSlug(title)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = initialData ? `/api/admin/posts/${initialData.id}` : '/api/admin/posts';
            const method = initialData ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                category_ids: selectedCategories
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save post');
            }

            router.push('/admin/posts');
            router.refresh();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const buildTree = (cats, parentId = null) => {
        return cats
            .filter(c => (c.parent_id === parentId) || (!parentId && !c.parent_id))
            .map(c => ({
                ...c,
                children: buildTree(cats, c.id)
            }));
    };

    const renderCategoryCheckbox = (cat, level = 0) => (
        <div key={cat.id}>
            <div className="checkbox-item" style={{ marginBottom: '0.25rem', marginLeft: `${level * 20}px` }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                    />
                    <span>{cat.name}</span>
                </label>
            </div>
            {cat.children && cat.children.map(child => renderCategoryCheckbox(child, level + 1))}
        </div>
    );

    const tree = buildTree(categories);

    // Helpers for Date
    const toLocalISOString = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0, 16);
    };

    const handleDateChange = (e) => {
        const val = e.target.value;
        if (!val) return;
        setFormData({ ...formData, published_at: new Date(val).toISOString() });
    };

    return (
        <form onSubmit={handleSubmit} className="post-form-layout">
            {error && <div className="col-span-full error-message mb-4">{error}</div>}

            <div className="form-main">
                <div className="card">
                    <div className="form-group">
                        <input
                            type="text"
                            value={formData.title}
                            onChange={handleTitleChange}
                            required
                            placeholder="Add title"
                            className="post-title-input"
                        />
                    </div>

                    <div className="form-group slug-group">
                        <span className="slug-prefix">Permalink:</span>
                        <span className="slug-host">{origin}/blog/</span>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            required
                            className="slug-input"
                        />
                        <button
                            type="button"
                            className="btn-icon-small"
                            onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }))}
                            title="Regenerate"
                        >
                            🔄
                        </button>
                    </div>

                    <div className="form-group editor-container">
                        <ReactQuill
                            theme="snow"
                            value={formData.content}
                            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                            className="rich-editor"
                            modules={{
                                toolbar: [
                                    [{ 'font': [] }, { 'size': [] }],
                                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                    ['bold', 'italic', 'underline', 'strike'],
                                    [{ 'color': [] }, { 'background': [] }],
                                    [{ 'script': 'sub' }, { 'script': 'super' }],
                                    [{ 'header': 1 }, { 'header': 2 }, 'blockquote', 'code-block'],
                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                                    [{ 'direction': 'rtl' }, { 'align': [] }],
                                    ['link', 'image', 'video', 'formula'],
                                    ['clean']
                                ],
                            }}
                        />
                    </div>
                </div>

                <div className="card mt-4">
                    <h3>Excerpt</h3>
                    <textarea
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        rows="3"
                        className="form-input"
                        placeholder="Write a short excerpt..."
                    />
                </div>
            </div>

            <div className="form-sidebar">
                <div className="card mb-4">
                    <div className="sidebar-header">
                        <h3>Publish</h3>
                    </div>
                    <div className="sidebar-content">
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="form-input"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Publish Date</label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={toLocalISOString(formData.published_at)}
                                onChange={handleDateChange}
                            />
                            <small className="text-secondary" style={{ fontSize: '0.8rem' }}>
                                Set a future date to schedule.
                            </small>
                        </div>

                        <div className="publish-meta">
                            <p>Author: <strong>Current User</strong></p>
                        </div>

                        <div className="sidebar-actions">
                            {initialData && (
                                <button type="button" className="btn btn-outline-danger" onClick={() => router.push('/admin/posts')}>
                                    Move to Trash
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary btn-full"
                            >
                                {loading ? 'Saving...' : (initialData ? 'Update' : 'Publish')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="sidebar-header">
                        <h3>Categories</h3>
                    </div>
                    <div className="sidebar-content">
                        <div className="categories-list" style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.5rem' }}>
                            {tree.length === 0 && <p className="text-sm text-secondary">No categories found.</p>}
                            {tree.map(root => renderCategoryCheckbox(root))}
                        </div>

                        <div className="add-category-section" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>+ Add New Category</p>

                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="New Category Name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="form-input text-sm"
                                    style={{ padding: '0.4rem' }}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                                <select
                                    className="form-input text-sm"
                                    style={{ padding: '0.4rem' }}
                                    value={newCategoryParent}
                                    onChange={(e) => setNewCategoryParent(e.target.value)}
                                >
                                    <option value="">-- Parent Category --</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={handleAddCategory}
                                disabled={isAddingCategory || !newCategoryName.trim()}
                                className="btn btn-secondary btn-sm w-full"
                            >
                                {isAddingCategory ? 'Adding...' : 'Add New Category'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </form>
    );
}
