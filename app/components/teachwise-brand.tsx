import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function TeachWiseBrand({
  compact = false,
  href = '/',
  tagline = 'Less marking. More teaching.',
  className = '',
  rightSlot,
}: {
  compact?: boolean;
  href?: string;
  tagline?: string;
  className?: string;
  rightSlot?: ReactNode;
}) {
  return (
    <Link href={href} className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <span
        className={`relative flex shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_16px_36px_rgba(2,8,23,0.35)] ${
          compact ? 'h-10 w-10' : 'h-12 w-12'
        }`}
      >
        <Image src="/owl-logo-5.svg" alt="TeachWise owl logo" fill className="object-cover p-1.5" priority />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-white">TeachWise</span>
          <span className="block truncate text-[11px] font-medium uppercase tracking-[0.18em]" style={{ color: 'var(--color-warning)' }}>
            {tagline}
          </span>
        </span>
      )}
      {rightSlot}
    </Link>
  );
}
