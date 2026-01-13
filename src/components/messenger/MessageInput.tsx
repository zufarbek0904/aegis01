import { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Smile, 
  Mic, 
  Send, 
  Camera,
  Image,
  FileText,
  MapPin,
  Contact,
  Clock,
  X,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { sendStyles } from '@/data/mockData';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MessageInputProps {
  onSendMessage: (content: string, options?: { isOneTime?: boolean; scheduledFor?: Date }) => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
}

const attachmentOptions = [
  { icon: Image, label: 'Фото или видео', color: 'from-violet-500 to-purple-600' },
  { icon: Camera, label: 'Камера', color: 'from-rose-500 to-pink-600' },
  { icon: FileText, label: 'Файл', color: 'from-blue-500 to-cyan-600' },
  { icon: MapPin, label: 'Геолокация', color: 'from-emerald-500 to-teal-600' },
  { icon: Contact, label: 'Контакт', color: 'from-amber-500 to-orange-600' },
  { icon: Clock, label: 'Отложить', color: 'from-indigo-500 to-blue-600' },
];

export function MessageInput({ onSendMessage, onStartTyping, onStopTyping }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isOneTime, setIsOneTime] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(sendStyles[0]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    onStartTyping?.();
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping?.();
    }, 2000);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), { isOneTime });
      setMessage('');
      setIsOneTime(false);
      onStopTyping?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="input-area p-3">
      {/* Attachment Panel */}
      <AnimatePresence>
        {showAttachments && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-3 gap-3 mb-3 p-3 bg-secondary/50 rounded-2xl"
          >
            {attachmentOptions.map((option, index) => (
              <motion.button
                key={option.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors"
              >
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br',
                  option.color
                )}>
                  <option.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-muted-foreground">{option.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording UI */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center gap-4 mb-3 p-4 bg-secondary/50 rounded-2xl"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-4 h-4 rounded-full bg-destructive"
            />
            <span className="font-mono text-lg">{formatTime(recordingTime)}</span>
            <div className="flex-1 flex items-center gap-1">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-primary rounded-full"
                  animate={{
                    height: [4, Math.random() * 24 + 4, 4],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">Свайп влево для отмены</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <div className="flex items-end gap-2">
        <button
          onClick={() => setShowAttachments(!showAttachments)}
          className={cn(
            'action-button flex-shrink-0',
            showAttachments && 'bg-primary text-primary-foreground'
          )}
        >
          {showAttachments ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>

        <div className="flex-1 flex items-end gap-2 bg-secondary rounded-3xl px-4 py-2">
          <button className="action-button p-1.5">
            <Smile className="w-5 h-5 text-muted-foreground" />
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Сообщение"
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground py-1.5 max-h-[120px]"
          />

          {/* One-time toggle */}
          <button
            onClick={() => setIsOneTime(!isOneTime)}
            className={cn(
              'action-button p-1.5',
              isOneTime && 'text-primary'
            )}
            title="Одноразовое сообщение"
          >
            <Flame className={cn('w-5 h-5', isOneTime && 'text-primary')} />
          </button>

          {!message.trim() && (
            <button className="action-button p-1.5">
              <Camera className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {message.trim() ? (
          <Popover>
            <PopoverTrigger asChild>
              <button
                onClick={handleSend}
                onContextMenu={(e) => e.preventDefault()}
                className="action-button-primary flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent 
              align="end" 
              className="w-64 p-2 bg-card border-border"
            >
              <div className="text-xs text-muted-foreground mb-2 px-2">
                Стиль отправки
              </div>
              <div className="space-y-1">
                {sendStyles.slice(0, 6).map(style => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setSelectedStyle(style);
                      handleSend();
                    }}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <span className="text-lg">{style.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{style.name}</p>
                      <p className="text-xs text-muted-foreground">{style.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <button
            onMouseDown={() => setIsRecording(true)}
            onMouseUp={() => setIsRecording(false)}
            onMouseLeave={() => setIsRecording(false)}
            onTouchStart={() => setIsRecording(true)}
            onTouchEnd={() => setIsRecording(false)}
            className={cn(
              'action-button-primary flex-shrink-0',
              isRecording && 'bg-destructive'
            )}
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
