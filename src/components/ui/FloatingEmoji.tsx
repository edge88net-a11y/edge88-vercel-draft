import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FloatingEmojiProps {
  emoji: string;
  duration?: number;
  startX?: number;
  startY?: number;
  onComplete?: () => void;
}

export function FloatingEmoji({ 
  emoji, 
  duration = 2, 
  startX = 50, 
  startY = 50,
  onComplete 
}: FloatingEmojiProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed text-6xl pointer-events-none z-50"
      style={{ left: `${startX}%`, top: `${startY}%` }}
      initial={{ opacity: 1, y: 0, scale: 0.5 }}
      animate={{ 
        opacity: [1, 1, 0],
        y: -200,
        scale: [0.5, 1.2, 1],
        rotate: [0, 10, -10, 0],
      }}
      transition={{ duration, ease: 'easeOut' }}
    >
      {emoji}
    </motion.div>
  );
}

// Component to trigger floating emojis on wins
export function useFloatingEmoji() {
  const [emojis, setEmojis] = useState<{ id: number; emoji: string; x: number; y: number }[]>([]);

  const trigger = (emoji: string, x?: number, y?: number) => {
    const id = Date.now();
    const randomX = x ?? Math.random() * 80 + 10;
    const randomY = y ?? Math.random() * 60 + 20;
    
    setEmojis((prev) => [...prev, { id, emoji, x: randomX, y: randomY }]);
  };

  const remove = (id: number) => {
    setEmojis((prev) => prev.filter((e) => e.id !== id));
  };

  const EmojiRenderer = () => (
    <>
      {emojis.map((item) => (
        <FloatingEmoji
          key={item.id}
          emoji={item.emoji}
          startX={item.x}
          startY={item.y}
          onComplete={() => remove(item.id)}
        />
      ))}
    </>
  );

  return { trigger, EmojiRenderer };
}
