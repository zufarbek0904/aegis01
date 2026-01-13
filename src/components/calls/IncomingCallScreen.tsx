import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video, User } from 'lucide-react';
import { Avatar } from '@/components/messenger/Avatar';
import { cn } from '@/lib/utils';

interface IncomingCallScreenProps {
  callerName: string;
  callerAvatar?: string;
  callType: 'audio' | 'video';
  onAnswer: () => void;
  onDecline: () => void;
}

export function IncomingCallScreen({
  callerName,
  callerAvatar,
  callType,
  onAnswer,
  onDecline,
}: IncomingCallScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-messenger-dark via-background to-messenger-dark"
    >
      {/* Animated background rings */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/20"
            initial={{ width: 100, height: 100, opacity: 0.5 }}
            animate={{
              width: [100, 300 + i * 100],
              height: [100, 300 + i * 100],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Call type indicator */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 backdrop-blur-sm"
      >
        {callType === 'video' ? (
          <Video className="h-4 w-4 text-primary" />
        ) : (
          <Phone className="h-4 w-4 text-primary" />
        )}
        <span className="text-sm font-medium text-primary">
          {callType === 'video' ? 'Видеозвонок' : 'Аудиозвонок'}
        </span>
      </motion.div>

      {/* Caller avatar */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative mb-6"
      >
        <div className="relative">
          <Avatar
            name={callerName}
            src={callerAvatar}
            size="xl"
            showPresence={false}
          />
          <motion.div
            className="absolute -inset-2 rounded-full border-2 border-primary/50"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Caller name */}
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-2 text-2xl font-bold text-foreground"
      >
        {callerName}
      </motion.h2>

      {/* Call status */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-12 text-muted-foreground"
      >
        Входящий {callType === 'video' ? 'видео' : 'аудио'} звонок...
      </motion.p>

      {/* Action buttons */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-12"
      >
        {/* Decline button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDecline}
          className="group flex flex-col items-center gap-3"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-messenger-error shadow-lg shadow-messenger-error/30 transition-all group-hover:shadow-xl group-hover:shadow-messenger-error/40">
            <PhoneOff className="h-7 w-7 text-white" />
          </div>
          <span className="text-sm text-muted-foreground">Отклонить</span>
        </motion.button>

        {/* Answer button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAnswer}
          className="group flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-messenger-online shadow-lg shadow-messenger-online/30 transition-all group-hover:shadow-xl group-hover:shadow-messenger-online/40"
          >
            {callType === 'video' ? (
              <Video className="h-7 w-7 text-white" />
            ) : (
              <Phone className="h-7 w-7 text-white" />
            )}
          </motion.div>
          <span className="text-sm text-muted-foreground">Ответить</span>
        </motion.button>
      </motion.div>

      {/* Swipe hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-xs text-muted-foreground"
      >
        Нажмите для ответа или отклонения
      </motion.p>
    </motion.div>
  );
}
