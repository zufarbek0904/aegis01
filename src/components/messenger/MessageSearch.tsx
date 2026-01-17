import { useState, useEffect, useCallback } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageSearchProps {
  messages: any[];
  onScrollToMessage: (messageId: string) => void;
  onClose: () => void;
}

export function MessageSearch({ messages, onScrollToMessage, onClose }: MessageSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = messages.filter(msg =>
      msg.content?.toLowerCase().includes(query.toLowerCase())
    );
    setResults(searchResults);
    setCurrentIndex(0);

    if (searchResults.length > 0) {
      onScrollToMessage(searchResults[0].id);
    }
  }, [query, messages]);

  const goToPrevious = () => {
    if (results.length === 0) return;
    const newIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
    setCurrentIndex(newIndex);
    onScrollToMessage(results[newIndex].id);
  };

  const goToNext = () => {
    if (results.length === 0) return;
    const newIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onScrollToMessage(results[newIndex].id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-center gap-2 p-2 bg-background border-b border-border"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по сообщениям..."
          className="pl-10 pr-20"
          autoFocus
        />
        {query && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {results.length > 0 ? `${currentIndex + 1}/${results.length}` : '0/0'}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          disabled={results.length === 0}
          className="h-8 w-8"
        >
          <ChevronUp className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          disabled={results.length === 0}
          className="h-8 w-8"
        >
          <ChevronDown className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// Utility function to highlight search text in message content
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}
