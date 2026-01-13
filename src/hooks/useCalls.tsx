import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface CallState {
  id: string;
  chatId: string;
  callerId: string;
  callerName: string;
  type: 'audio' | 'video';
  status: 'ringing' | 'connecting' | 'active' | 'ended' | 'missed' | 'declined';
  startedAt?: Date;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

export function useCalls() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeCall, setActiveCall] = useState<CallState | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallState | null>(null);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('calls-incoming')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'calls' },
        async (payload) => {
          const call = payload.new as any;
          if (call.caller_id === user.id) return;

          const { data: membership } = await supabase
            .from('chat_members')
            .select('*')
            .eq('chat_id', call.chat_id)
            .eq('user_id', user.id)
            .single();

          if (!membership) return;

          const { data: caller } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', call.caller_id)
            .single();

          setIncomingCall({
            id: call.id,
            chatId: call.chat_id,
            callerId: call.caller_id,
            callerName: caller?.display_name || 'Неизвестный',
            type: call.type,
            status: 'ringing',
            isMuted: false,
            isVideoEnabled: call.type === 'video',
            isScreenSharing: false,
          });

          toast({
            title: `Входящий ${call.type === 'video' ? 'видео' : 'аудио'} звонок`,
            description: caller?.display_name || 'Неизвестный',
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const initializeMedia = async (type: 'audio' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });
      localStream.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Нет доступа к камере/микрофону' });
      return null;
    }
  };

  const startCall = async (chatId: string, type: 'audio' | 'video') => {
    if (!user || !profile) return;

    const stream = await initializeMedia(type);
    if (!stream) return;

    const { data: call, error } = await supabase
      .from('calls')
      .insert({ chat_id: chatId, caller_id: user.id, type, status: 'ringing' })
      .select()
      .single();

    if (error || !call) return;

    setActiveCall({
      id: call.id,
      chatId,
      callerId: user.id,
      callerName: profile.display_name || 'Вы',
      type,
      status: 'ringing',
      isMuted: false,
      isVideoEnabled: type === 'video',
      isScreenSharing: false,
    });
  };

  const answerCall = async () => {
    if (!incomingCall || !user) return;
    await initializeMedia(incomingCall.type);

    await supabase.from('calls').update({ status: 'active', started_at: new Date().toISOString() }).eq('id', incomingCall.id);

    setActiveCall({ ...incomingCall, status: 'active', startedAt: new Date() });
    setIncomingCall(null);
  };

  const declineCall = async () => {
    if (!incomingCall) return;
    await supabase.from('calls').update({ status: 'declined' }).eq('id', incomingCall.id);
    setIncomingCall(null);
  };

  const endCall = async () => {
    if (activeCall) {
      await supabase.from('calls').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', activeCall.id);
    }
    localStream.current?.getTracks().forEach(track => track.stop());
    peerConnection.current?.close();
    localStream.current = null;
    remoteStream.current = null;
    peerConnection.current = null;
    setActiveCall(null);
  };

  const toggleMute = () => {
    const audioTrack = localStream.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setActiveCall(prev => prev ? { ...prev, isMuted: !audioTrack.enabled } : null);
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStream.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setActiveCall(prev => prev ? { ...prev, isVideoEnabled: videoTrack.enabled } : null);
    }
  };

  const toggleScreenShare = async () => {
    if (!activeCall) return;
    setActiveCall(prev => prev ? { ...prev, isScreenSharing: !prev.isScreenSharing } : null);
  };

  return {
    activeCall, incomingCall, localVideoRef, remoteVideoRef,
    startCall, answerCall, declineCall, endCall,
    toggleMute, toggleVideo, toggleScreenShare,
  };
}
