import Link from 'next/link';
import type { ComponentType } from 'react';
import { Callout } from './Callout';
import { Pre } from './Pre';
import { CodeInline } from './CodeInline';
import { Badge } from '@/components/ui/Badge';
import { AnimatedFlowchart } from './AnimatedFlowchart';

type Components = Record<string, ComponentType<any>>;

function Anchor({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const isExternal = typeof href === 'string' && href.startsWith('http');
  const className =
    'text-gold underline decoration-line-strong underline-offset-4 transition-colors hover:text-gold-hover';

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href ?? '#'} className={className} {...props}>
      {children}
    </Link>
  );
}

export const mdxComponents: Components = {
  a: Anchor,
  Callout,
  Badge,
  pre: Pre,
  code: CodeInline,
  AnimatedFlowchart,
  h2: (props) => (
    <h2 {...props} className="mb-4 mt-10 scroll-mt-20 text-2xl font-semibold tracking-tight text-ink-primary" />
  ),
  h3: (props) => (
    <h3 {...props} className="mb-3 mt-8 scroll-mt-20 text-xl font-semibold text-ink-primary" />
  ),
  p: (props) => <p {...props} className="leading-7 text-ink-secondary" />,
  ul: (props) => <ul {...props} className="list-disc space-y-2 pl-6 text-ink-secondary" />,
  ol: (props) => <ol {...props} className="space-y-2 text-ink-secondary" />,
  li: (props) => <li {...props} className="leading-7" />,
  blockquote: (props) => (
    <blockquote
      {...props}
      className="border-l-2 border-gold bg-surface-1/50 px-4 py-1 text-ink-secondary"
    />
  ),
  table: (props) => <table {...props} />,
  strong: (props) => <strong {...props} className="font-semibold text-ink-primary" />,
  hr: () => <hr className="my-8 border-line-subtle" />,
};
