import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getAllPosts() {
    try {
        // Check if posts directory exists
        if (!fs.existsSync(postsDirectory)) {
            return [];
        }

        const fileNames = fs.readdirSync(postsDirectory);
        const allPostsData = fileNames
            .filter(fileName => fileName.endsWith('.md'))
            .map(fileName => {
                const slug = fileName.replace(/\.md$/, '');
                const fullPath = path.join(postsDirectory, fileName);
                const fileContents = fs.readFileSync(fullPath, 'utf8');
                const { data } = matter(fileContents);

                return {
                    slug,
                    title: data.title || 'Untitled',
                    date: data.date || '',
                    author: data.author || 'Anonymous',
                    excerpt: data.excerpt || '',
                };
            });

        // Sort posts by date
        return allPostsData.sort((a, b) => {
            if (a.date < b.date) {
                return 1;
            } else {
                return -1;
            }
        });
    } catch (error) {
        console.error('Error reading posts:', error);
        return [];
    }
}

export async function getPostBySlug(slug) {
    try {
        const fullPath = path.join(postsDirectory, `${slug}.md`);

        if (!fs.existsSync(fullPath)) {
            return null;
        }

        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        // Convert markdown to HTML
        const processedContent = await remark()
            .use(html)
            .process(content);
        const contentHtml = processedContent.toString();

        return {
            slug,
            title: data.title || 'Untitled',
            date: data.date || '',
            author: data.author || 'Anonymous',
            excerpt: data.excerpt || '',
            content: contentHtml,
        };
    } catch (error) {
        console.error('Error reading post:', error);
        return null;
    }
}

export function getAllPostSlugs() {
    try {
        if (!fs.existsSync(postsDirectory)) {
            return [];
        }

        const fileNames = fs.readdirSync(postsDirectory);
        return fileNames
            .filter(fileName => fileName.endsWith('.md'))
            .map(fileName => fileName.replace(/\.md$/, ''));
    } catch (error) {
        console.error('Error reading post slugs:', error);
        return [];
    }
}
