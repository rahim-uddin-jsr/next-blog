'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function DeletePostButton({ postId }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            // Use the existing delete route logic but trigger via fetch if possible,
            // or just submit a hidden form constructed on the fly?
            // Actually, the route app/api/admin/posts/[id]/delete/route.js expects POST.
            // Fetch is fine.

            const response = await fetch(`/api/admin/posts/${postId}/delete`, {
                method: 'POST',
            });

            if (response.ok) {
                // The API redirects, but fetch follows redirects automatically.
                // We just need to refresh the current page view.
                router.refresh();
            } else {
                alert('Failed to delete post');
            }
        } catch (error) {
            console.error('Delete failed', error);
            alert('An error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="btn-icon btn-delete"
                title="Delete"
                disabled={isDeleting}
            >
                {isDeleting ? '...' : '🗑️'}
            </button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
                isDanger={true}
            />
        </>
    );
}
