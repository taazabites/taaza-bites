import { cn } from '@/src/lib/utils';
import { resolveSubscriptionStatus, STATUS_BADGE } from '@/src/lib/subscription-lifecycle';

export function StatusBadge({
  status,
  endDate,
  className,
}: {
  status?: string;
  endDate?: unknown;
  className?: string;
}) {
  const resolved = resolveSubscriptionStatus({ status, endDate });
  const badge = STATUS_BADGE[resolved] || STATUS_BADGE.pending;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest',
        badge.className,
        className
      )}
    >
      {badge.label}
    </span>
  );
}
