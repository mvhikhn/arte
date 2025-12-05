import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    description?: string;
    content: string;
}

export interface BlogPostMeta {
    slug: string;
    title: string;
    date: string;
    description?: string;
}

/**
 * Get all blog post metadata (for listing)
 */
export function getAllBlogPosts(): BlogPostMeta[] {
    if (!fs.existsSync(BLOG_DIR)) {
        return [];
    }

    const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));

    const posts = files.map(filename => {
        const slug = filename.replace('.md', '');
        const filePath = path.join(BLOG_DIR, filename);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = matter(fileContent);

        return {
            slug,
            title: data.title || slug,
            date: data.date || 'Unknown date',
            description: data.description,
        };
    });

    // Sort by date (newest first)
    return posts.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
    });
}

/**
 * Get a single blog post by slug
 */
export function getBlogPost(slug: string): BlogPost | null {
    const filePath = path.join(BLOG_DIR, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
        slug,
        title: data.title || slug,
        date: data.date || 'Unknown date',
        description: data.description,
        content,
    };
}

/**
 * Get all blog slugs (for static generation)
 */
export function getAllBlogSlugs(): string[] {
    if (!fs.existsSync(BLOG_DIR)) {
        return [];
    }

    return fs.readdirSync(BLOG_DIR)
        .filter(f => f.endsWith('.md'))
        .map(f => f.replace('.md', ''));
}
