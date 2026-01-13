import { Phone, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCallContext } from './CallProvider';
import { cn } from '@/lib/utils';

interface CallButtonsProps {
  chatId: string;
  className?: string;
}

export function CallButtons({ chatId, className }: CallButtonsProps) {
  const { startCall, hasActiveCall } = useCallContext();

  const handleAudioCall = () => {
    if (!hasActiveCall) {
      startCall(chatId, 'audio');
    }
  };

  const handleVideoCall = () => {
    if (!hasActiveCall) {
      startCall(chatId, 'video');
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAudioCall}
        disabled={hasActiveCall}
        className={cn(
          'action-button',
          hasActiveCall && 'opacity-50 cursor-not-allowed'
        )}
        title="Аудиозвонок"
      >
        <Phone className="w-5 h-5" />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleVideoCall}
        disabled={hasActiveCall}
        className={cn(
          'action-button',
          hasActiveCall && 'opacity-50 cursor-not-allowed'
        )}
        title="Видеозвонок"
      >
        <Video className="w-5 h-5" />
      </motion.button>
    </div>
  );
}
