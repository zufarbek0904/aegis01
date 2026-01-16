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
  Flame,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { sendStyles } from '@/data/mockData';
import { MediaUploadDialog } from './MediaUploadDialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MessageInputProps {
  onSendMessage: (content: string, options?: { isOneTime?: boolean; scheduledFor?: Date; type?: string; mediaUrl?: string }) => void;
  onStartTyping?: () => void;
  onStopTyping?: () => void;
}

export function MessageInput({ onSendMessage, onStartTyping, onStopTyping }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isOneTime, setIsOneTime] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(sendStyles[0]);
  const [uploadType, setUploadType] = useState<'photo' | 'video' | 'file' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
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

  const handleUploadComplete = (files: { url: string; type: string; name: string }[]) => {
    files.forEach(file => {
      onSendMessage(file.name, { 
        type: file.type, 
        mediaUrl: file.url,
        isOneTime 
      });
    });
    setShowAttachments(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const attachmentOptions = [
    { icon: Image, label: 'Фото', color: 'from-violet-500 to-purple-600', action: () => setUploadType('photo') },
    { icon: Video, label: 'Видео', color: 'from-rose-500 to-pink-600', action: () => setUploadType('video') },
    { icon: FileText, label: 'Файл', color: 'from-blue-500 to-cyan-600', action: () => setUploadType('file') },
    { icon: MapPin, label: 'Геолокация', color: 'from-emerald-500 to-teal-600', action: () => {} },
    { icon: Contact, label: 'Контакт', color: 'from-amber-500 to-orange-600', action: () => {} },
    { icon: Clock, label: 'Отложить', color: 'from-indigo-500 to-blue-600', action: () => {} },
  ];

  return (
    <>
      <MediaUploadDialog
        open={uploadType !== null}
        onOpenChange={(open) => !open && setUploadType(null)}
        onUploadComplete={handleUploadComplete}
        type={uploadType || 'photo'}
      />

      <div className="input-area p-2 sm:p-3 border-t border-border bg-background">
        {/* Attachment Panel */}
        <AnimatePresence>
          {showAttachments && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-3 gap-2 mb-3 p-2 sm:p-3 bg-secondary/50 rounded-2xl"
            >
              {attachmentOptions.map((option, index) => (
                <motion.button
                  key={option.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    option.action();
                    if (option.label !== 'Геолокация' && option.label !== 'Контакт' && option.label !== 'Отложить') {
                      setShowAttachments(false);
                    }
                  }}
                  className="flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl hover:bg-secondary transition-colors"
                >
                  <div className={cn(
                    'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-gradient-to-br',
                    option.color
                  )}>
                    <option.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">{option.label}</span>
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
              className="flex items-center gap-3 mb-3 p-3 sm:p-4 bg-secondary/50 rounded-2xl"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-destructive flex-shrink-0"
              />
              <span className="font-mono text-base sm:text-lg">{formatTime(recordingTime)}</span>
              <div className="flex-1 flex items-center gap-0.5 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 sm:w-1 bg-primary rounded-full flex-shrink-0"
                    animate={{
                      height: [4, Math.random() * 20 + 4, 4],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">Свайп влево для отмены</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Input Area */}
        <div className="flex items-end gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowAttachments(!showAttachments)}
            className={cn(
              'action-button flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10',
              showAttachments && 'bg-primary text-primary-foreground'
            )}
          >
            {showAttachments ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <div className="flex-1 flex items-end gap-1.5 sm:gap-2 bg-secondary rounded-2xl sm:rounded-3xl px-2 sm:px-4 py-1.5 sm:py-2 min-w-0">
            <button className="action-button p-1 sm:p-1.5 flex-shrink-0">
              <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </button>

            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Сообщение"
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground py-1 sm:py-1.5 max-h-[100px] text-sm sm:text-base min-w-0"
            />

            {/* One-time toggle */}
            <button
              onClick={() => setIsOneTime(!isOneTime)}
              className={cn(
                'action-button p-1 sm:p-1.5 flex-shrink-0',
                isOneTime && 'text-primary'
              )}
              title="Одноразовое сообщение"
            >
              <Flame className={cn('w-4 h-4 sm:w-5 sm:h-5', isOneTime && 'text-primary')} />
            </button>

            {!message.trim() && (
              <button className="action-button p-1 sm:p-1.5 flex-shrink-0">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              </button>
            )}
          </div>

          {message.trim() ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  onClick={handleSend}
                  onContextMenu={(e) => e.preventDefault()}
                  className="action-button-primary flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent 
                align="end" 
                className="w-56 sm:w-64 p-2 bg-card border-border"
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
                'action-button-primary flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10',
                isRecording && 'bg-destructive'
              )}
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
