import { createContext, useContext, ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCalls } from '@/hooks/useCalls';
import { IncomingCallScreen } from './IncomingCallScreen';
import { ActiveCallScreen } from './ActiveCallScreen';

interface CallContextType {
  startCall: (chatId: string, type: 'audio' | 'video') => Promise<void>;
  hasActiveCall: boolean;
}

const CallContext = createContext<CallContextType | null>(null);

export function useCallContext() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCallContext must be used within CallProvider');
  }
  return context;
}

interface CallProviderProps {
  children: ReactNode;
}

export function CallProvider({ children }: CallProviderProps) {
  const {
    activeCall,
    incomingCall,
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
  } = useCalls();

  const contextValue: CallContextType = {
    startCall,
    hasActiveCall: !!activeCall,
  };

  return (
    <CallContext.Provider value={contextValue}>
      {children}

      <AnimatePresence>
        {/* Incoming call screen */}
        {incomingCall && (
          <IncomingCallScreen
            callerName={incomingCall.callerName}
            callType={incomingCall.type}
            onAnswer={answerCall}
            onDecline={declineCall}
          />
        )}

        {/* Active call screen */}
        {activeCall && (
          <ActiveCallScreen
            callerName={activeCall.callerName}
            callType={activeCall.type}
            status={activeCall.status === 'ringing' ? 'connecting' : 'active'}
            startedAt={activeCall.startedAt}
            isMuted={activeCall.isMuted}
            isVideoEnabled={activeCall.isVideoEnabled}
            isScreenSharing={activeCall.isScreenSharing}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            onEndCall={endCall}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={toggleScreenShare}
          />
        )}
      </AnimatePresence>
    </CallContext.Provider>
  );
}
