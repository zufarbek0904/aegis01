import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-background/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0] 
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6"
          style={{ boxShadow: 'var(--shadow-glow)' }}
        >
          <MessageCircle className="w-12 h-12 text-primary-foreground" />
        </motion.div>
        
        <h2 className="text-2xl font-bold mb-2">Messenger Pro</h2>
        <p className="text-muted-foreground max-w-sm">
          Выберите чат слева для начала общения или создайте новый
        </p>
      </motion.div>
    </div>
  );
}
