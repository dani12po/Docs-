import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllSlugs } from '@/lib/nav';
import { isLocale, parsePage } from '@/lib/content';
import { mdxComponents } from '@/components/mdx/mdxComponents';
import { remarkPlugins, rehypePlugins } from '@/lib/typography';
import { TableOfContents } from '@/components/toc/TableOfContents';

export const dynamicParams = false;

interface DocParams {
  locale?: string;
  slug?: string[];
}

export function generateStaticParams(): { locale: string; slug: string[] }[] {
  return [
    { locale: 'id', slug: [] },
    ...getAllSlugs('id').map((slug) => ({ locale: 'id' as const, slug })),
    ...getAllSlugs('en').map((slug) => ({ locale: 'en' as const, slug })),
  ];
}

export async function generateMetadata({ params }: { params: DocParams }): Promise<Metadata> {
  const locale = params.locale ?? 'id';
  const slug = params.slug ?? [];
  if (slug.length === 0) return { title: locale === 'en' ? 'KORAMP Docs' : 'Dokumentasi KORAMP' };
  try {
    const page = parsePage(locale, slug);
    return { title: page.data.title, description: page.data.description };
  } catch {
    return { title: locale === 'en' ? 'KORAMP Docs' : 'Dokumentasi KORAMP' };
  }
}

export default async function DocPage({ params }: { params: DocParams }) {
  const locale = params.locale ?? 'id';
  if (!isLocale(locale)) redirect(`/docs/id/${(params.slug ?? []).join('/')}`);

  const slug = params.slug ?? [];
  if (slug.length === 0) {
    redirect(`/docs/${locale}/memulai/pengenalan`);
  }

  let page;
  try {
    page = parsePage(locale, slug);
  } catch {
    notFound();
    return null;
  }

  const { title, description } = page.data;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
      <article className="min-w-0">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-ink-primary">
          {title}
        </h1>
        {description ? (
          <p className="mb-8 border-b border-line-subtle pb-6 text-ink-secondary">
            {description}
          </p>
        ) : (
          <div className="mb-8 border-b border-line-subtle pb-6" />
        )}

        <div className="prose prose-invert max-w-none">
          <MDXRemote
            source={page.content}
            components={mdxComponents}
            options={{
              // blockJS defaults to true in next-mdx-remote v6 (CVE-2026-0969).
              // Safe to disable here — all MDX is trusted first-party content,
              // never user-submitted. Required for rehype-pretty-code to compile.
              blockJS: false,
              mdxOptions: { remarkPlugins, rehypePlugins },
            }}
          />
        </div>
      </article>

      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <TableOfContents items={page.toc} />
        </div>
      </aside>
    </div>
  );
}
