import { ActivityType } from '@/types/messenger';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingIndicatorProps {
  userName?: string;
  activityType: ActivityType;
  isGroup?: boolean;
}

const activityLabels: Record<Exclude<ActivityType, null>, string> = {
  typing: 'печатает',
  recording_voice: 'записывает голосовое',
  recording_video: 'записывает видео',
  choosing_photo: 'выбирает фото',
  sending_music: 'отправляет музыку',
  attaching_file: 'прикрепляет файл',
  sending_location: 'отправляет геолокацию',
};

export function TypingIndicator({ userName, activityType, isGroup = false }: TypingIndicatorProps) {
  if (!activityType) return null;

  const label = activityLabels[activityType];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        className="flex items-center gap-1.5 text-xs text-primary"
      >
        {isGroup && userName && (
          <span className="font-medium">{userName}</span>
        )}
        <span>{label}</span>
        <div className="typing-dots">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="message-bubble-incoming rounded-message px-4 py-3 w-fit"
    >
      <div className="typing-dots">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </motion.div>
  );
}
