import { redirect } from 'next/navigation';
import { verifyAuth, hasRole } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import { query } from '@/lib/db';
import CategoryManager from './components/CategoryManager';

async function getCategories() {
    const cats = await query(`
    SELECT c.*, COUNT(pc.post_id) as post_count 
    FROM categories c 
    LEFT JOIN post_categories pc ON c.id = pc.category_id 
    GROUP BY c.id 
    ORDER BY c.name ASC
  `);
    return cats;
}

export default async function CategoriesPage() {
    const user = await verifyAuth();

    if (!user || user.role === 'user') {
        redirect('/auth/login?redirect=/admin/categories');
    }

    const categories = await getCategories();

    return (
        <AdminLayout user={user}>
            <div className="page-header">
                <h1>Categories</h1>
            </div>

            <CategoryManager initialCategories={categories} />
        </AdminLayout>
    );
}
