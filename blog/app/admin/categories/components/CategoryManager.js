'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function CategoryManager({ initialCategories }) {
    const router = useRouter();
    const [categories, setCategories] = useState(initialCategories);
    const [formData, setFormData] = useState({ id: null, name: '', slug: '', parent_id: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const resetForm = () => {
        setFormData({ id: null, name: '', slug: '', parent_id: '' });
        setIsEditing(false);
    };

    const handleEdit = (cat) => {
        setFormData({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            parent_id: cat.parent_id || ''
        });
        setIsEditing(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        setLoading(true);

        try {
            const url = isEditing
                ? `/api/admin/categories/${formData.id}`
                : '/api/admin/categories';

            const method = isEditing ? 'PUT' : 'POST';
            const body = {
                name: formData.name,
                slug: formData.slug,
                parent_id: formData.parent_id || null
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                router.refresh();
                // We should reload categories locally or wait for refresh.
                // For now, let's just refresh and optimistic update if possible.
                // Simpler: reload page via router.refresh() and maybe fetch?
                // Next.js router.refresh() re-runs server components.
                // But we need to update local state if we want instant feedback or wait.
                // Effectively, we can just wait for refresh or fetch manually.
                const updated = await res.json();
                if (isEditing) {
                    setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
                } else {
                    setCategories(prev => [...prev, updated]);
                }
                resetForm();
            } else {
                alert('Failed to save category');
            }
        } catch (err) {
            console.error(err);
            alert('Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (cat) => {
        setCategoryToDelete(cat);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;
        try {
            const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
                router.refresh();
            } else {
                alert('Failed to delete');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteModalOpen(false);
            setCategoryToDelete(null);
        }
    };

    // Hierarchy Logic
    const getIndent = (cat) => {
        // Very specific logic: we need to find depth.
        // Doing this recursively on render is cleaner.
        return 0;
    };

    // Recursively build tree
    const buildTree = (cats, parentId = null) => {
        return cats
            .filter(c => (c.parent_id === parentId) || (!parentId && !c.parent_id)) // Handle null/undefined vs 0? DB uses NULL.
            .map(c => ({
                ...c,
                children: buildTree(cats, c.id)
            }));
    };

    const tree = buildTree(categories, null);

    const renderRow = (cat, level = 0) => {
        return (
            <>
                <tr key={cat.id}>
                    <td>
                        <div style={{ marginLeft: `${level * 20}px`, display: 'flex', alignItems: 'center' }}>
                            {level > 0 && <span style={{ marginRight: '5px', color: '#999' }}>└</span>}
                            <span className="font-weight-bold">{cat.name}</span>
                        </div>
                    </td>
                    <td>/{cat.slug}</td>
                    <td>{cat.post_count || 0} posts</td>
                    <td>
                        <div className="action-buttons">
                            <button onClick={() => handleEdit(cat)} className="btn-icon" title="Edit">✏️</button>
                            <button onClick={() => confirmDelete(cat)} className="btn-icon btn-delete" title="Delete">🗑️</button>
                        </div>
                    </td>
                </tr>
                {cat.children && cat.children.map(child => renderRow(child, level + 1))}
            </>
        );
    };

    return (
        <div className="grid-layout-2col">
            {/* Form Section */}
            <div className="card h-fit sticky-top">
                <h3>{isEditing ? 'Edit Category' : 'Add New Category'}</h3>
                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Slug (Optional)</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="auto-generated"
                        />
                    </div>

                    <div className="form-group">
                        <label>Parent Category</label>
                        <select
                            className="form-input"
                            value={formData.parent_id}
                            onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                        >
                            <option value="">None (Top Level)</option>
                            {categories
                                .filter(c => c.id !== formData.id) // Cannot be parent of self
                                .map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                        </select>
                    </div>

                    <div className="form-actions">
                        {isEditing && (
                            <button type="button" onClick={resetForm} className="btn btn-secondary w-full">Cancel</button>
                        )}
                        <button type="submit" disabled={loading} className="btn btn-primary w-full">
                            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Add')}
                        </button>
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className="card">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Count</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tree.length === 0 ? (
                                <tr><td colSpan="4" className="text-center">No categories found.</td></tr>
                            ) : (
                                tree.map(root => renderRow(root, 0))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Category"
                message={`Are you sure you want to delete "${categoryToDelete?.name}"?`}
                isDanger={true}
            />
        </div>
    );
}
