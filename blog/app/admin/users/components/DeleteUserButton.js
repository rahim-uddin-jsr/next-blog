'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function DeleteUserButton({ userId, userName, isSelf }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/users/${userId}/delete`, {
                method: 'POST',
            });

            if (response.ok) {
                router.refresh();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Delete failed', error);
            alert('An error occurred');
        } finally {
            setIsDeleting(false);
        }
    };

    if (isSelf) return null;

    return (
        <>
            <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="btn-icon btn-delete"
                title="Delete User"
                disabled={isDeleting}
            >
                {isDeleting ? '...' : '🗑️'}
            </button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete User"
                message={`Are you sure you want to delete user "${userName}"? This action cannot be undone.`}
                isDanger={true}
            />
        </>
    );
}
