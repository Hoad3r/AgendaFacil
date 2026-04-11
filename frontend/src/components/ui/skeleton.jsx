import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-primary/10', className)} {...props} />;
}

export function SkeletonStat({ className, ...props }) {
  return (
    <div className={cn('animate-pulse rounded-xl border bg-card p-6', className)} {...props}>
      <div className="h-4 w-24 rounded bg-primary/10 mb-3" />
      <div className="h-8 w-16 rounded bg-primary/10" />
    </div>
  );
}

export function SkeletonCard({ className, ...props }) {
  return (
    <div className={cn('animate-pulse rounded-xl border bg-card p-4', className)} {...props}>
      <div className="h-40 rounded-lg bg-primary/10 mb-4" />
      <div className="h-4 w-3/4 rounded bg-primary/10 mb-2" />
      <div className="h-3 w-1/2 rounded bg-primary/10" />
    </div>
  );
}
