import { PresenceStatus } from '@/types/messenger';
import { PresenceIndicator } from './PresenceIndicator';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  name: string;
  src?: string;
  presence?: PresenceStatus;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPresence?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const presenceSizeMap = {
  sm: 'sm' as const,
  md: 'sm' as const,
  lg: 'md' as const,
  xl: 'lg' as const,
};

// Generate consistent color based on name
function getAvatarColor(name: string): string {
  const colors = [
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-red-500 to-rose-600',
    'from-indigo-500 to-blue-600',
    'from-green-500 to-emerald-600',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ 
  name, 
  src, 
  presence, 
  size = 'md', 
  showPresence = true,
  className 
}: AvatarProps) {
  const initials = getInitials(name);
  const gradientClass = getAvatarColor(name);

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover',
            sizeMap[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br',
            gradientClass,
            sizeMap[size]
          )}
        >
          {initials || <User className="w-1/2 h-1/2" />}
        </div>
      )}
      {showPresence && presence && (
        <PresenceIndicator 
          status={presence} 
          size={presenceSizeMap[size]} 
        />
      )}
    </div>
  );
}
