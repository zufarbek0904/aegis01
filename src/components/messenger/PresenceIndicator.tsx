import { PresenceStatus } from '@/types/messenger';
import { cn } from '@/lib/utils';

interface PresenceIndicatorProps {
  status: PresenceStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export function PresenceIndicator({ status, size = 'md', className }: PresenceIndicatorProps) {
  if (status === 'offline' || status === 'invisible') {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-full border-2 border-background absolute bottom-0 right-0',
        sizeMap[size],
        status === 'online' && 'online-indicator',
        status === 'recently' && 'bg-messenger-typing',
        className
      )}
    />
  );
}
