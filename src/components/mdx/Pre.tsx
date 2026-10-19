'use client';

import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';

function extractText(node: ReactNode): string {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && node !== null && 'props' in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return extractText(props?.children);
  }
  return '';
}

export function Pre({ children, ...props }: HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);
  const language =
    (props as Record<string, unknown>)['data-language'] ||
    (props as Record<string, unknown>)['dataLanguage'] ||
    '';
  const code = extractText(children);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard tidak tersedia — abaikan */
    }
  };

  return (
    <div className="not-prose my-6 overflow-hidden rounded-lg border border-line bg-surface-1">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <span className="text-xs font-medium text-ink-muted">
          {language ? String(language) : 'code'}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink-primary"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Tersalin' : 'Salin'}
        </button>
      </div>
      <pre
        {...props}
        className="overflow-x-auto p-4 text-sm leading-relaxed text-ink-secondary"
      >
        {children}
      </pre>
    </div>
  );
}
