import { MessageStatus as Status } from '@/types/messenger';
import { Check, CheckCheck, Clock, AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MessageStatusProps {
  status: Status;
  className?: string;
}

export function MessageStatus({ status, className }: MessageStatusProps) {
  const iconClass = cn('w-4 h-4', className);

  switch (status) {
    case 'sending':
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Clock className={cn(iconClass, 'text-muted-foreground')} />
        </motion.div>
      );
    case 'sent':
      return <Check className={cn(iconClass, 'text-muted-foreground')} />;
    case 'delivered':
      return <CheckCheck className={cn(iconClass, 'text-muted-foreground')} />;
    case 'read':
      return <CheckCheck className={cn(iconClass, 'text-primary')} />;
    case 'failed':
      return <AlertCircle className={cn(iconClass, 'text-destructive')} />;
    default:
      return null;
  }
}

export function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs text-destructive hover:underline"
    >
      <RotateCcw className="w-3 h-3" />
      Повторить
    </button>
  );
}
