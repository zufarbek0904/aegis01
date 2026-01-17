import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SupportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
}

interface SupportMessage {
  id: string;
  content: string;
  is_from_admin: boolean;
  created_at: string;
}

export function SupportDialog({ isOpen, onClose }: SupportDialogProps) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchTickets();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTickets(data);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const handleCreateTicket = async () => {
    if (!user || !subject.trim() || !initialMessage.trim()) return;

    setLoading(true);
    try {
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: subject.trim(),
          message: initialMessage.trim(),
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Add initial message
      await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticket.id,
          sender_id: user.id,
          content: initialMessage.trim(),
          is_from_admin: false,
        });

      toast.success('Тикет создан');
      setSubject('');
      setInitialMessage('');
      setShowNewTicket(false);
      setSelectedTicket(ticket);
      fetchTickets();
    } catch (error) {
      toast.error('Ошибка создания тикета');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedTicket || !newMessage.trim()) return;

    setLoading(true);
    try {
      await supabase
        .from('support_messages')
        .insert({
          ticket_id: selectedTicket.id,
          sender_id: user.id,
          content: newMessage.trim(),
          is_from_admin: false,
        });

      setNewMessage('');
      fetchMessages(selectedTicket.id);
    } catch (error) {
      toast.error('Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Поддержка
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex min-h-0">
          {/* Tickets list */}
          <div className="w-64 border-r flex flex-col">
            <div className="p-2 border-b">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setShowNewTicket(true);
                  setSelectedTicket(null);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Новый тикет
              </Button>
            </div>
            <ScrollArea className="flex-1">
              {tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setShowNewTicket(false);
                  }}
                  className={cn(
                    'w-full p-3 text-left hover:bg-secondary/50 transition-colors border-b',
                    selectedTicket?.id === ticket.id && 'bg-secondary'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(ticket.status)}
                    <span className="font-medium text-sm truncate">{ticket.subject}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(ticket.created_at), 'd MMM, HH:mm', { locale: ru })}
                  </p>
                </button>
              ))}
              {tickets.length === 0 && (
                <p className="p-4 text-center text-muted-foreground text-sm">
                  Нет обращений
                </p>
              )}
            </ScrollArea>
          </div>

          {/* Content area */}
          <div className="flex-1 flex flex-col">
            {showNewTicket ? (
              <div className="p-4 space-y-4">
                <Input
                  placeholder="Тема обращения"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <Textarea
                  placeholder="Опишите вашу проблему..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  rows={6}
                />
                <Button 
                  onClick={handleCreateTicket} 
                  disabled={loading || !subject.trim() || !initialMessage.trim()}
                  className="w-full"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Отправить'}
                </Button>
              </div>
            ) : selectedTicket ? (
              <>
                <ScrollArea className="flex-1 p-4">
                  <AnimatePresence>
                    {messages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'mb-3 max-w-[80%]',
                          msg.is_from_admin ? 'mr-auto' : 'ml-auto'
                        )}
                      >
                        <div className={cn(
                          'rounded-2xl px-4 py-2',
                          msg.is_from_admin 
                            ? 'bg-secondary' 
                            : 'bg-primary text-primary-foreground'
                        )}>
                          {msg.is_from_admin && (
                            <p className="text-xs text-primary font-medium mb-1">Поддержка</p>
                          )}
                          <p className="text-sm">{msg.content}</p>
                          <p className={cn(
                            'text-[10px] mt-1',
                            msg.is_from_admin ? 'text-muted-foreground' : 'text-primary-foreground/70'
                          )}>
                            {format(new Date(msg.created_at), 'HH:mm', { locale: ru })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </ScrollArea>
                <div className="p-3 border-t flex gap-2">
                  <Input
                    placeholder="Ваше сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={loading || !newMessage.trim()}
                    size="icon"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Выберите тикет или создайте новый
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
