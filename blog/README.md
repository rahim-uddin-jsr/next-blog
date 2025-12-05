# Next.js Blog with MySQL Authentication

A modern, full-featured blog built with Next.js 16, featuring MySQL authentication, markdown-based posts, and a premium dark-mode UI.

## Features

- ✨ **Modern UI**: Premium dark mode design with smooth animations and gradients
- 📝 **Markdown Blog Posts**: Write posts in markdown with frontmatter metadata
- 🔒 **MySQL Authentication**: Secure user authentication with JWT tokens
- ⚡ **Next.js 16**: Built with the latest Next.js App Router
- 🎨 **Responsive Design**: Mobile-first, fully responsive layout
- 🚀 **Performance**: Optimized with static generation and server components

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: MySQL
- **Authentication**: JWT with HTTP-only cookies
- **Password Hashing**: bcryptjs
- **Markdown Processing**: gray-matter + remark
- **Styling**: Custom CSS with CSS Variables

## Setup Instructions

### 1. Database Setup

Make sure you have MySQL running (XAMPP, WAMP, or standalone MySQL).

Run the SQL script to create the database and tables:

```bash
mysql -u root -p < scripts/setup_mysql.sql
```

Or manually execute the SQL in `scripts/setup_mysql.sql` using phpMyAdmin or MySQL Workbench.

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following content:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=blog_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important**: Change the `JWT_SECRET` to a random, secure string in production!

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
blog/
├── app/
│   ├── api/
│   │   └── auth/          # Authentication API routes
│   │       ├── login/
│   │       ├── signup/
│   │       └── logout/
│   ├── auth/              # Auth pages (login, signup)
│   ├── blog/              # Blog pages
│   │   ├── [slug]/        # Individual post pages
│   │   └── page.js        # Blog listing page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/
│   ├── auth.js            # Auth utilities
│   ├── db.js              # Database connection
│   └── posts.js           # Blog post utilities
├── posts/                 # Markdown blog posts
├── scripts/
│   └── setup_mysql.sql    # Database setup script
└── package.json
```

## Usage

### Creating Blog Posts

1. Create a new `.md` file in the `posts/` directory
2. Add frontmatter metadata:

```markdown
---
title: "Your Post Title"
date: "2024-01-15"
author: "Author Name"
excerpt: "A brief description of your post"
---

# Your Post Content

Write your content here in markdown...
```

3. The post will automatically appear on the blog page

### Authentication Flow

1. **Sign Up**: Navigate to `/auth/signup` to create an account
2. **Login**: Navigate to `/auth/login` to sign in
3. **Protected Routes**: Add authentication checks to protect routes

### API Endpoints

- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login and receive JWT token
- `POST /api/auth/logout` - Logout and clear auth cookie

## Testing

### Test Authentication

1. **Sign Up**:
   - Go to http://localhost:3000/auth/signup
   - Create an account with email and password
   - You should be redirected to login

2. **Login**:
   - Go to http://localhost:3000/auth/login
   - Enter your credentials
   - You should be redirected to the blog page

3. **View Blog**:
   - Go to http://localhost:3000/blog
   - You should see the list of blog posts
   - Click on a post to view it

### Test Database Connection

You can test the database connection by trying to sign up. If successful, check your MySQL database:

```sql
USE blog_db;
SELECT * FROM users;
```

## Customization

### Changing Colors

Edit the CSS variables in `app/globals.css`:

```css
:root {
  --accent-primary: #6366f1;  /* Primary accent color */
  --accent-secondary: #8b5cf6; /* Secondary accent color */
  /* ... other variables */
}
```

### Adding More Features

- Add a "Create Post" page for authenticated users
- Implement post editing and deletion
- Add comments system
- Add categories and tags
- Implement search functionality

## Security Notes

- Always use HTTPS in production
- Change the JWT_SECRET to a strong, random value
- Never commit `.env.local` to version control
- Implement rate limiting for auth endpoints
- Add CSRF protection for forms
- Validate and sanitize all user inputs

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
