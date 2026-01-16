import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface VoicePlayerProps {
  src: string;
  duration?: number;
  isOutgoing?: boolean;
}

export function VoicePlayer({ src, duration = 0, isOutgoing }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setAudioDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div className={`flex items-center gap-3 min-w-[200px] ${isOutgoing ? 'flex-row-reverse' : ''}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className={`shrink-0 h-10 w-10 rounded-full ${
          isOutgoing ? 'bg-white/20 hover:bg-white/30' : 'bg-primary/10 hover:bg-primary/20'
        }`}
      >
        {isPlaying ? (
          <Pause className={`w-5 h-5 ${isOutgoing ? 'text-white' : 'text-primary'}`} />
        ) : (
          <Play className={`w-5 h-5 ${isOutgoing ? 'text-white' : 'text-primary'}`} />
        )}
      </Button>

      <div className="flex-1 space-y-1">
        {/* Progress Bar */}
        <div className={`h-1 rounded-full ${isOutgoing ? 'bg-white/30' : 'bg-muted'}`}>
          <motion.div
            className={`h-full rounded-full ${isOutgoing ? 'bg-white' : 'bg-primary'}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Waveform (decorative) */}
        <div className={`flex items-center gap-0.5 h-4 ${isOutgoing ? 'justify-end' : ''}`}>
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`w-0.5 rounded-full ${
                isOutgoing ? 'bg-white/50' : 'bg-primary/30'
              } ${i / 30 * 100 < progress ? (isOutgoing ? 'bg-white' : 'bg-primary') : ''}`}
              style={{
                height: `${Math.sin(i * 0.5) * 8 + 10}px`,
              }}
            />
          ))}
        </div>

        {/* Time */}
        <div className={`text-xs ${isOutgoing ? 'text-white/70 text-right' : 'text-muted-foreground'}`}>
          {formatTime(currentTime)} / {formatTime(audioDuration)}
        </div>
      </div>
    </div>
  );
}
