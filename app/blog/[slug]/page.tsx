import { getBlogPost, getAllBlogSlugs } from '@/utils/blog';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map(slug => ({ slug }));
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/blog" className="text-sm font-medium text-black/60 hover:text-black transition-colors">
            ← All Posts
          </Link>
          <time className="text-xs text-black/40 uppercase tracking-wider">
            {post.date}
          </time>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <article>
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              {post.title}
            </h1>
            {post.description && (
              <p className="text-lg text-black/50">
                {post.description}
              </p>
            )}
          </header>

          {/* Markdown Content */}
          <div className="prose prose-lg max-w-none
                        prose-headings:font-semibold prose-headings:text-black
                        prose-h1:text-2xl prose-h1:mt-12 prose-h1:mb-4
                        prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-3
                        prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-2
                        prose-p:text-black/70 prose-p:leading-relaxed
                        prose-li:text-black/70
                        prose-a:text-black prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-black/60
                        prose-code:bg-black/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                        prose-pre:bg-[#0a0a0a] prose-pre:text-[#a0a0a0] prose-pre:rounded-lg prose-pre:overflow-x-auto
                        prose-table:border-collapse prose-th:text-left prose-th:p-3 prose-th:border-b-2 prose-th:border-black/10
                        prose-td:p-3 prose-td:border-b prose-td:border-black/5
                        prose-hr:border-black/10 prose-hr:my-12
                        prose-blockquote:border-l-4 prose-blockquote:border-black/20 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-black/60
                        prose-strong:text-black prose-strong:font-semibold
                        prose-ul:list-disc prose-ol:list-decimal
                    ">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Custom code block rendering
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  if (!inline && match) {
                    return (
                      <pre className="bg-[#0a0a0a] text-[#a0a0a0] p-4 rounded-lg overflow-x-auto text-sm">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  }
                  return (
                    <code className="bg-black/5 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                // Custom table rendering
                table({ children }: any) {
                  return (
                    <div className="overflow-x-auto my-6">
                      <table className="w-full border-collapse">
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children }: any) {
                  return (
                    <th className="text-left p-3 border-b-2 border-black/10 font-semibold">
                      {children}
                    </th>
                  );
                },
                td({ children }: any) {
                  return (
                    <td className="p-3 border-b border-black/5">
                      {children}
                    </td>
                  );
                },
                // Custom link rendering
                a({ href, children }: any) {
                  const isExternal = href?.startsWith('http');
                  return (
                    <a
                      href={href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      className="text-black underline underline-offset-2 hover:text-black/60 transition-colors"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-black/10">
          <Link
            href="/blog"
            className="text-sm text-black/50 hover:text-black transition-colors"
          >
            ← Back to all posts
          </Link>
        </footer>
      </main>
    </div>
  );
}
