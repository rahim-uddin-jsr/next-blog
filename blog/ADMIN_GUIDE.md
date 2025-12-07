# Admin Dashboard - Setup & Usage Guide

## 🎯 Overview

The admin dashboard provides a comprehensive role-based administration system for managing your blog.

## 👥 User Roles

The system supports 4 role levels with hierarchical permissions:

### 1. **User** (Level 0)
- Basic registered user
- Can comment on posts
- No admin access

### 2. **Editor** (Level 1)
- All User permissions
- Create, edit, and delete posts
- Manage categories
- Moderate comments
- Access: Dashboard, Posts, Categories, Comments

### 3. **Admin** (Level 2)
- All Editor permissions
- Manage users (create, edit, delete, change roles)
- View activity logs
- Access: All Editor features + Users, Activity Logs

### 4. **Super Admin** (Level 3)
- All Admin permissions
- Manage system settings
- Full access to all features
- Access: Everything

## 🗄️ Database Setup

### Step 1: Run the Admin Setup SQL

You need to manually run the SQL commands to set up the admin tables. Open phpMyAdmin or MySQL Workbench and execute:

```sql
-- Navigate to: http://localhost/phpmyadmin
-- Select database: blog_db
-- Go to SQL tab and paste the contents of scripts/setup_admin.sql
```

Or use MySQL command line:
```bash
mysql -u root blog_db < scripts/setup_admin.sql
```

### Step 2: Verify Tables Created

Check that these tables exist:
- `users` (with `role` column added)
- `posts`
- `categories`
- `post_categories`
- `comments`
- `activity_logs`

## 🔐 Default Admin Account

A default super admin account is created:

- **Email**: admin@blog.com
- **Password**: admin123
- **Role**: super_admin

**⚠️ IMPORTANT**: Change this password immediately after first login!

## 📊 Admin Dashboard Features

### Dashboard (`/admin`)
- Overview statistics
- Total posts, users, comments, categories
- Recent activity feed
- Quick action buttons

### Posts Management (`/admin/posts`)
- Create new posts
- Edit existing posts
- Delete posts
- Change post status (draft/published/archived)
- Assign categories
- View post analytics

### Categories (`/admin/categories`)
- Create categories
- Edit category details
- Delete categories
- View posts per category

### Comments (`/admin/comments`)
- Approve/reject comments
- Mark as spam
- Delete comments
- View comment details

### Users Management (`/admin/users`)
- View all users
- Create new users
- Edit user details
- Change user roles
- Delete users
- View user activity

### Settings (`/admin/settings`)
- Site configuration
- Email settings
- Security settings
- Backup & restore

### Activity Logs (`/admin/logs`)
- View all admin actions
- Filter by user, action type, date
- Export logs

## 🚀 Accessing the Admin Dashboard

1. **Login as Admin**:
   ```
   http://localhost:3000/auth/login
   Email: admin@blog.com
   Password: admin123
   ```

2. **Navigate to Admin**:
   ```
   http://localhost:3000/admin
   ```

3. **Or add `/admin` to any page URL**

## 🔒 Permission System

### Role Hierarchy
```
user (0) < editor (1) < admin (2) < super_admin (3)
```

### Permission Checks

The system uses these helper functions:

```javascript
// Check if user has minimum role level
hasRole(userRole, requiredRole)

// Specific permission checks
canManagePosts(userRole)      // editor+
canManageUsers(userRole)       // admin+
canManageSettings(userRole)    // super_admin only
```

### Protected Routes

All admin routes automatically check authentication and role:

```javascript
// In any admin page
const user = await verifyAuth();
if (!user || user.role === 'user') {
  redirect('/auth/login');
}
```

## 📝 Creating New Admin Pages

### Example: Create `/admin/analytics` page

1. **Create the page file**:
```javascript
// app/admin/analytics/page.js
import { redirect } from 'next/navigation';
import { verifyAuth, hasRole } from '@/lib/auth';
import AdminLayout from '@/components/AdminLayout';

export default async function AnalyticsPage() {
  const user = await verifyAuth();
  
  if (!user || !hasRole(user.role, 'admin')) {
    redirect('/auth/login');
  }

  return (
    <AdminLayout user={user}>
      <h1>Analytics</h1>
      {/* Your analytics content */}
    </AdminLayout>
  );
}
```

2. **Add to sidebar menu** (in `components/AdminLayout.js`):
```javascript
const menuItems = [
  // ... existing items
  { 
    name: 'Analytics', 
    path: '/admin/analytics', 
    icon: '📈', 
    roles: ['admin', 'super_admin'] 
  },
];
```

## 🎨 Customizing the Dashboard

### Change Colors

Edit `app/globals.css` CSS variables:
```css
:root {
  --accent-primary: #6366f1;  /* Change primary color */
  --accent-secondary: #8b5cf6; /* Change secondary color */
}
```

### Add Custom Widgets

Create reusable components in `components/admin/`:
```javascript
// components/admin/StatsWidget.js
export default function StatsWidget({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-number">{value}</p>
      </div>
    </div>
  );
}
```

## 🔧 API Endpoints for Admin

### User Management
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user
- `PATCH /api/admin/users/[id]/role` - Change role

### Post Management
- `POST /api/admin/posts` - Create post
- `PUT /api/admin/posts/[id]` - Update post
- `DELETE /api/admin/posts/[id]` - Delete post

### Activity Logging
```javascript
// Log admin actions
await logActivity(userId, 'user_created', 'user', newUserId, {
  email: newUser.email,
  role: newUser.role
});
```

## 📱 Responsive Design

The admin dashboard is fully responsive:
- **Desktop**: Full sidebar with labels
- **Tablet**: Collapsible sidebar
- **Mobile**: Icon-only sidebar

Toggle sidebar with the `←/→` button.

## 🛡️ Security Best Practices

1. **Always verify authentication**:
   ```javascript
   const user = await verifyAuth();
   if (!user) redirect('/auth/login');
   ```

2. **Check permissions**:
   ```javascript
   if (!hasRole(user.role, 'admin')) {
     return { error: 'Forbidden' };
   }
   ```

3. **Log sensitive actions**:
   ```javascript
   await logActivity(user.id, 'user_deleted', 'user', deletedId);
   ```

4. **Validate all inputs**:
   ```javascript
   if (!email || !isValidEmail(email)) {
     return { error: 'Invalid email' };
   }
   ```

## 🐛 Troubleshooting

### Can't access admin dashboard
- Check if logged in
- Verify user role is not 'user'
- Check database connection

### Tables don't exist
- Run `scripts/setup_admin.sql`
- Verify in phpMyAdmin

### Permission denied
- Check user role in database
- Verify role hierarchy

### Sidebar not showing
- Check browser console for errors
- Verify `AdminLayout` component is imported

## 📚 Next Steps

1. Run the SQL setup script
2. Login with default admin account
3. Change admin password
4. Create additional admin users
5. Start managing your blog!

## 🎉 Features Coming Soon

- Bulk actions for posts/users
- Advanced analytics
- Email notifications
- Media library
- SEO tools
- Export/Import data
- Custom fields
- Workflow automation

---

**Need help?** Check the main README.md or create an issue.
