import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from './Avatar';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye } from 'lucide-react';

interface ReadUser {
  id: string;
  name: string;
  avatar?: string;
  readAt: Date;
}

interface ReadReceiptsProps {
  readers: ReadUser[];
  totalMembers: number;
  isOutgoing?: boolean;
  className?: string;
}

export function ReadReceipts({ readers, totalMembers, isOutgoing, className }: ReadReceiptsProps) {
  const [showDialog, setShowDialog] = useState(false);
  
  if (readers.length === 0) return null;

  const displayedReaders = readers.slice(0, 3);
  const remainingCount = readers.length - 3;

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={() => setShowDialog(true)}
              className={cn(
                'flex items-center gap-1 mt-1',
                isOutgoing ? 'justify-end' : 'justify-start',
                className
              )}
            >
              <div className="flex -space-x-2">
                {displayedReaders.map((reader, index) => (
                  <motion.div
                    key={reader.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <Avatar
                      name={reader.name}
                      src={reader.avatar}
                      size="xs"
                    />
                  </motion.div>
                ))}
              </div>
              {remainingCount > 0 && (
                <span className="text-xs text-muted-foreground ml-1">
                  +{remainingCount}
                </span>
              )}
              <Eye className="w-3 h-3 text-muted-foreground ml-1" />
              <span className="text-xs text-muted-foreground">
                {readers.length}/{totalMembers}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Прочитали {readers.length} из {totalMembers}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Кто прочитал
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {readers.map((reader, index) => (
                <motion.div
                  key={reader.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50"
                >
                  <Avatar
                    name={reader.name}
                    src={reader.avatar}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{reader.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {reader.readAt.toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
