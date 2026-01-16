import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus } from 'lucide-react';

interface MessageReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onReact: (emoji: string) => void;
  isOutgoing?: boolean;
}

const allEmojis = [
  ['👍', '👎', '❤️', '🔥', '🥰', '👏', '😁', '😂'],
  ['🤔', '🤯', '😱', '🤬', '😢', '🎉', '🤩', '🙏'],
  ['💯', '✨', '🚀', '⚡', '🌟', '💪', '👀', '🤝'],
];

export function MessageReactions({ reactions, onReact, isOutgoing }: MessageReactionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (reactions.length === 0) return null;

  return (
    <div className={cn(
      'flex items-center gap-1 flex-wrap mt-1',
      isOutgoing ? 'justify-end' : 'justify-start'
    )}>
      {reactions.map((reaction, index) => (
        <motion.button
          key={reaction.emoji}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onReact(reaction.emoji)}
          className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors',
            reaction.reacted 
              ? 'bg-primary/20 border border-primary/50' 
              : 'bg-secondary/80 hover:bg-secondary'
          )}
        >
          <span>{reaction.emoji}</span>
          {reaction.count > 1 && (
            <span className="text-muted-foreground">{reaction.count}</span>
          )}
        </motion.button>
      ))}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button className="w-6 h-6 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-colors">
            <Plus className="w-3 h-3 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align={isOutgoing ? 'end' : 'start'}>
          <div className="space-y-1">
            {allEmojis.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1">
                {row.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(emoji);
                      setIsOpen(false);
                    }}
                    className="text-xl p-1 hover:bg-secondary rounded transition-colors hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Emoji Picker for adding reactions
interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  trigger: React.ReactNode;
}

export function EmojiPicker({ onSelect, trigger }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">Реакции</div>
          {allEmojis.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1">
              {row.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSelect(emoji);
                    setIsOpen(false);
                  }}
                  className="text-xl p-1.5 hover:bg-secondary rounded-lg transition-all hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
