import type { ReactNode } from 'react';
import clsx from 'clsx';

export type BadgeStatus = 'shipped' | 'active' | 'planned' | 'future';

const MAP: Record<BadgeStatus, { label: string; className: string }> = {
  shipped: { label: 'Sudah Ship', className: 'border-green/40 bg-green/10 text-green' },
  active: { label: 'Aktif', className: 'border-gold/40 bg-gold/10 text-gold' },
  planned: { label: 'Direncanakan', className: 'border-line bg-surface-1 text-ink-secondary' },
  future: {
    label: 'Masa Depan',
    className: 'border-dashed border-line bg-transparent text-ink-muted',
  },
};

export function Badge({
  status = 'planned',
  children,
}: {
  status?: BadgeStatus;
  children?: ReactNode;
}) {
  const style = MAP[status] ?? MAP.planned;
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        style.className,
      )}
    >
      {children ?? style.label}
    </span>
  );
}
