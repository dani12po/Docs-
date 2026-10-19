import type { PluggableList } from 'unified';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

/**
 * Pemilik plugin remark/rehype (pemisahan dari mdxComponents map —
 * lihat review desain, finding #3).
 */
export const remarkPlugins: PluggableList = [remarkGfm];

export const rehypePlugins: PluggableList = [
  rehypeSlug,
  [rehypeAutolinkHeadings, { behavior: 'wrap' }],
  [rehypePrettyCode, { theme: 'github-dark-dimmed', keepBackground: true }],
];
