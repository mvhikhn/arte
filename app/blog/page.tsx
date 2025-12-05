import { getAllBlogPosts } from '@/utils/blog';
import Link from 'next/link';

export default function BlogIndex() {
    const posts = getAllBlogPosts();

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Header */}
            <header className="border-b border-black/5 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-sm font-medium text-black/60 hover:text-black transition-colors">
                        ← Home
                    </Link>
                    <h1 className="text-sm font-medium">Blog</h1>
                    <div className="w-12" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-2">Blog</h1>
                <p className="text-black/50 mb-12">Thoughts on creative coding, design, and technology.</p>

                <div className="space-y-8">
                    {posts.map(post => (
                        <article key={post.slug} className="group">
                            <Link href={`/blog/${post.slug}`} className="block">
                                <time className="text-xs text-black/40 uppercase tracking-wider">
                                    {post.date}
                                </time>
                                <h2 className="text-xl font-semibold mt-1 group-hover:text-black/70 transition-colors">
                                    {post.title}
                                </h2>
                                {post.description && (
                                    <p className="text-black/50 mt-2 line-clamp-2">
                                        {post.description}
                                    </p>
                                )}
                            </Link>
                        </article>
                    ))}

                    {posts.length === 0 && (
                        <p className="text-black/40 text-center py-12">No blog posts yet.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
