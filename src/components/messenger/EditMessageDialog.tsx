import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Message } from '@/types/messenger';
import { Edit, History, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EditHistory {
  content: string;
  editedAt: Date;
}

interface EditMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: Message | null;
  editHistory?: EditHistory[];
  onSave: (messageId: string, newContent: string) => void;
}

export function EditMessageDialog({
  open,
  onOpenChange,
  message,
  editHistory = [],
  onSave,
}: EditMessageDialogProps) {
  const [content, setContent] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (message) {
      setContent(message.content || '');
    }
  }, [message]);

  useEffect(() => {
    if (!open) {
      setShowHistory(false);
    }
  }, [open]);

  const handleSave = () => {
    if (message && content.trim() && content !== message.content) {
      onSave(message.id, content.trim());
      onOpenChange(false);
    }
  };

  const hasChanges = message && content.trim() !== message.content;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Редактировать сообщение
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Edit History */}
          {editHistory.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <History className="w-4 h-4" />
                История изменений ({editHistory.length})
                {showHistory ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              {showHistory && (
                <div className="mt-2 space-y-2 max-h-[150px] overflow-y-auto">
                  {editHistory.map((edit, index) => (
                    <div
                      key={index}
                      className="p-2 bg-secondary rounded-lg text-sm"
                    >
                      <p className="text-muted-foreground text-xs mb-1">
                        {format(edit.editedAt, 'd MMM, HH:mm', { locale: ru })}
                      </p>
                      <p className="line-clamp-2">{edit.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Current Content */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Текст сообщения
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Введите текст сообщения..."
              className="min-h-[100px] resize-none"
              autoFocus
            />
          </div>

          {/* Original Content Reference */}
          {message && message.content !== content && (
            <div className="p-3 bg-secondary/50 rounded-lg border-l-2 border-muted-foreground">
              <p className="text-xs text-muted-foreground mb-1">Оригинал:</p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {message.content}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
