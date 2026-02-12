/**
 * 加载状态组件
 */
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'spinner' | 'skeleton' | 'dots';
}

const sizeClasses: Record<string, { spinner: string; text: string; dot: string; gap: string }> = {
  sm: { spinner: 'h-4 w-4', text: 'text-sm', dot: 'h-1.5 w-1.5', gap: 'gap-1.5' },
  md: { spinner: 'h-8 w-8', text: 'text-base', dot: 'h-2.5 w-2.5', gap: 'gap-2.5' },
  lg: { spinner: 'h-12 w-12', text: 'text-lg', dot: 'h-3.5 w-3.5', gap: 'gap-3.5' },
};

export function Loading({ size = 'md', text, variant = 'spinner' }: LoadingProps) {
  const sizes = sizeClasses[size];

  if (variant === 'skeleton') {
    return <Skeleton />;
  }

  if (variant === 'dots') {
    return <DotsLoading size={size} text={text} />;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={clsx('animate-spin text-blue-500', sizes.spinner)} />
      {text && <p className={clsx('text-gray-500', sizes.text)}>{text}</p>}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={clsx('animate-pulse bg-gray-200 rounded', className)}
      style={{ width, height }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton width={120} height={24} />
          <Skeleton width={80} height={40} />
          <Skeleton width={100} height={20} />
        </div>
        <Skeleton width={64} height={64} />
      </div>
      <div className="grid grid-cols-4 gap-4 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={60} />
        ))}
      </div>
    </div>
  );
}

function DotsLoading({ size, text }: { size: string; text?: string }) {
  const sizes = sizeClasses[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={clsx('flex gap-2', sizes.gap)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={clsx('bg-blue-500 rounded-full animate-bounce', sizes.dot)}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );
}
