import { redirect } from 'next/navigation';
import { verifyAuth, hasRole } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';
import { query } from '@/lib/db';

async function getLogs() {
    const logs = await query(`
    SELECT l.*, u.name as user_name, u.email as user_email
    FROM activity_logs l
    LEFT JOIN users u ON l.user_id = u.id
    ORDER BY l.created_at DESC
    LIMIT 100
  `);
    return logs;
}

export default async function LogsPage() {
    const user = await verifyAuth();

    if (!user || !hasRole(user.role, 'admin')) {
        redirect('/auth/login?redirect=/admin/logs');
    }

    const logs = await getLogs();

    return (
        <AdminLayout user={user}>
            <div className="page-header">
                <h1>Activity Logs</h1>
            </div>

            <div className="card">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center">No logs found.</td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td>
                                            <div>{log.user_name || 'System'}</div>
                                            <div className="text-sm text-gray-500">{log.user_email}</div>
                                        </td>
                                        <td>
                                            <span className="font-mono text-sm">{log.action}</span>
                                        </td>
                                        <td>{log.details}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
