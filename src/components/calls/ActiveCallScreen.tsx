import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  Monitor,
  MoreVertical,
  Minimize2,
  Maximize2,
  Users,
  MessageSquare,
} from 'lucide-react';
import { Avatar } from '@/components/messenger/Avatar';
import { cn } from '@/lib/utils';

interface ActiveCallScreenProps {
  callerName: string;
  callerAvatar?: string;
  callType: 'audio' | 'video';
  status: 'connecting' | 'active' | 'reconnecting';
  startedAt?: Date;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
}

export function ActiveCallScreen({
  callerName,
  callerAvatar,
  callType,
  status,
  startedAt,
  isMuted,
  isVideoEnabled,
  isScreenSharing,
  localVideoRef,
  remoteVideoRef,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
}: ActiveCallScreenProps) {
  const [duration, setDuration] = useState('00:00');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Update call duration
  useEffect(() => {
    if (status !== 'active' || !startedAt) return;

    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [status, startedAt]);

  // Auto-hide controls
  useEffect(() => {
    if (callType === 'video') {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [showControls, callType]);

  const handleInteraction = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (callType === 'video') {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleInteraction}
      className={cn(
        'fixed z-50 flex flex-col bg-messenger-dark',
        isFullscreen ? 'inset-0' : 'bottom-4 right-4 h-[500px] w-[360px] rounded-2xl shadow-2xl overflow-hidden'
      )}
    >
      {/* Video area */}
      {callType === 'video' ? (
        <div className="relative flex-1 bg-black">
          {/* Remote video (fullscreen) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />

          {/* Local video (PiP) */}
          <motion.div
            drag
            dragConstraints={{ left: 0, right: 200, top: 0, bottom: 300 }}
            className="absolute right-4 top-4 h-32 w-24 overflow-hidden rounded-xl bg-messenger-dark/80 shadow-lg"
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                'h-full w-full object-cover',
                !isVideoEnabled && 'hidden'
              )}
            />
            {!isVideoEnabled && (
              <div className="flex h-full w-full items-center justify-center">
                <VideoOff className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </motion.div>

          {/* Screen sharing indicator */}
          {isScreenSharing && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-primary/90 px-3 py-1.5 text-sm text-white"
            >
              <Monitor className="h-4 w-4" />
              <span>Демонстрация экрана</span>
            </motion.div>
          )}
        </div>
      ) : (
        /* Audio call view */
        <div className="relative flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-messenger-dark via-background to-messenger-dark">
          {/* Animated audio waves */}
          <div className="absolute inset-0 flex items-center justify-center">
            {status === 'active' && (
              <>
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border border-primary/10"
                    animate={{
                      width: [100, 200 + i * 50],
                      height: [100, 200 + i * 50],
                      opacity: [0.3, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </>
            )}
          </div>

          <Avatar
            name={callerName}
            src={callerAvatar}
            size="xl"
            showPresence={false}
          />
          <h3 className="mt-4 text-xl font-semibold text-foreground">{callerName}</h3>
        </div>
      )}

      {/* Top bar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-4"
          >
            <div className="flex items-center gap-3">
              {!isFullscreen && (
                <Avatar name={callerName} src={callerAvatar} size="sm" showPresence={false} />
              )}
              <div>
                <h4 className="font-medium text-white">{callerName}</h4>
                <p className="text-sm text-white/70">
                  {status === 'connecting' && 'Соединение...'}
                  {status === 'reconnecting' && 'Переподключение...'}
                  {status === 'active' && duration}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="rounded-full bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5 text-white" />
                ) : (
                  <Maximize2 className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6"
          >
            <div className="flex items-center justify-center gap-4">
              {/* Mute button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleMute}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                  isMuted
                    ? 'bg-messenger-error text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </motion.button>

              {/* Video toggle (for video calls) */}
              {callType === 'video' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleVideo}
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                    !isVideoEnabled
                      ? 'bg-messenger-error text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  )}
                >
                  {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </motion.button>
              )}

              {/* Screen share (desktop only) */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onToggleScreenShare}
                className={cn(
                  'hidden h-12 w-12 items-center justify-center rounded-full transition-colors md:flex',
                  isScreenSharing
                    ? 'bg-primary text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                <Monitor className="h-5 w-5" />
              </motion.button>

              {/* Speaker toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                  !isSpeakerOn
                    ? 'bg-white/50 text-black'
                    : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                <Volume2 className="h-5 w-5" />
              </motion.button>

              {/* End call button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEndCall}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-messenger-error shadow-lg shadow-messenger-error/30 transition-all hover:shadow-xl hover:shadow-messenger-error/40"
              >
                <PhoneOff className="h-6 w-6 text-white" />
              </motion.button>

              {/* More options */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
              >
                <MoreVertical className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Quick actions */}
            <div className="mt-4 flex justify-center gap-6">
              <button className="flex flex-col items-center gap-1 text-white/70 transition-colors hover:text-white">
                <Users className="h-5 w-5" />
                <span className="text-xs">Участники</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-white/70 transition-colors hover:text-white">
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs">Чат</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Muted indicator */}
      <AnimatePresence>
        {isMuted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute left-4 bottom-32 flex items-center gap-2 rounded-full bg-messenger-error/90 px-3 py-1.5 text-sm text-white"
          >
            <MicOff className="h-4 w-4" />
            <span>Вы отключили микрофон</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
