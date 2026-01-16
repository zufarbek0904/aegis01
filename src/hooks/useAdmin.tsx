import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'super_admin' | 'admin' | 'moderator' | 'support' | 'user';

interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  profile: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    presence: string | null;
    is_banned: boolean;
    banned_at: string | null;
    ban_reason: string | null;
    last_ip: string | null;
  } | null;
  role: AppRole;
}

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_id: string | null;
  target_type: string | null;
  details: any;
  ip_address: string | null;
  created_at: string;
}

interface ModerationFlag {
  id: string;
  message_id: string | null;
  user_id: string | null;
  flag_type: string;
  severity: string;
  ai_confidence: number | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
  message?: any;
}

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<AppRole>('user');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [moderationFlags, setModerationFlags] = useState<ModerationFlag[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalMessages: 0,
    flaggedMessages: 0,
    bannedUsers: 0,
  });

  // Check if current user has admin access
  const checkAdminAccess = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setUserRole('user');
      setLoading(false);
      return;
    }

    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['super_admin', 'admin', 'moderator'])
        .single();

      if (roleData) {
        setIsAdmin(true);
        setUserRole(roleData.role as AppRole);
      } else {
        setIsAdmin(false);
        setUserRole('user');
      }
    } catch (error) {
      setIsAdmin(false);
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  // Fetch all users with their profiles and roles
  const fetchUsers = async (searchQuery?: string) => {
    if (!isAdmin) return;

    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (searchQuery) {
      query = query.or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`);
    }

    const { data: profiles } = await query.limit(100);

    if (profiles) {
      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id)
            .single();

          return {
            id: profile.id,
            email: '',
            created_at: profile.created_at || '',
            profile: {
              username: profile.username,
              display_name: profile.display_name,
              avatar_url: profile.avatar_url,
              presence: profile.presence,
              is_banned: profile.is_banned || false,
              banned_at: profile.banned_at,
              ban_reason: profile.ban_reason,
              last_ip: profile.last_ip,
            },
            role: (roleData?.role as AppRole) || 'user',
          };
        })
      );
      setUsers(usersWithRoles);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    if (!isAdmin) return;

    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      setAuditLogs(data as AuditLog[]);
    }
  };

  // Fetch moderation flags
  const fetchModerationFlags = async () => {
    if (!isAdmin) return;

    const { data } = await supabase
      .from('moderation_flags')
      .select('*, message:messages(*)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      setModerationFlags(data as ModerationFlag[]);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    if (!isAdmin) return;

    const [
      { count: totalUsers },
      { count: onlineUsers },
      { count: totalMessages },
      { count: flaggedMessages },
      { count: bannedUsers },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('presence', 'online'),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('moderation_flags').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
    ]);

    setStats({
      totalUsers: totalUsers || 0,
      onlineUsers: onlineUsers || 0,
      totalMessages: totalMessages || 0,
      flaggedMessages: flaggedMessages || 0,
      bannedUsers: bannedUsers || 0,
    });
  };

  // Ban user
  const banUser = async (userId: string, reason: string) => {
    if (!isAdmin || !user) return false;

    const { error } = await supabase
      .from('profiles')
      .update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        banned_by: user.id,
        ban_reason: reason,
      })
      .eq('id', userId);

    if (!error) {
      await logAction('ban_user', userId, 'user', { reason });
      await fetchUsers();
    }

    return !error;
  };

  // Unban user
  const unbanUser = async (userId: string) => {
    if (!isAdmin || !user) return false;

    const { error } = await supabase
      .from('profiles')
      .update({
        is_banned: false,
        banned_at: null,
        banned_by: null,
        ban_reason: null,
      })
      .eq('id', userId);

    if (!error) {
      await logAction('unban_user', userId, 'user');
      await fetchUsers();
    }

    return !error;
  };

  // Assign role (super_admin only)
  const assignRole = async (userId: string, role: AppRole) => {
    if (userRole !== 'super_admin' || !user) return false;

    const { error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role,
        assigned_by: user.id,
      });

    if (!error) {
      await logAction('assign_role', userId, 'user', { role });
      await fetchUsers();
    }

    return !error;
  };

  // Delete message
  const deleteMessageAdmin = async (messageId: string) => {
    if (!isAdmin || !user) return false;

    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', messageId);

    if (!error) {
      await logAction('delete_message', messageId, 'message');
    }

    return !error;
  };

  // Update moderation flag status
  const updateModerationFlag = async (flagId: string, status: string, notes?: string) => {
    if (!isAdmin || !user) return false;

    const { error } = await supabase
      .from('moderation_flags')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        notes,
      })
      .eq('id', flagId);

    if (!error) {
      await logAction('review_flag', flagId, 'moderation_flag', { status, notes });
      await fetchModerationFlags();
    }

    return !error;
  };

  // Log action
  const logAction = async (action: string, targetId?: string, targetType?: string, details?: any) => {
    if (!user) return;

    await supabase.from('audit_logs').insert({
      admin_id: user.id,
      action,
      target_id: targetId,
      target_type: targetType,
      details,
    });
  };

  return {
    isAdmin,
    userRole,
    loading,
    users,
    auditLogs,
    moderationFlags,
    stats,
    fetchUsers,
    fetchAuditLogs,
    fetchModerationFlags,
    fetchStats,
    banUser,
    unbanUser,
    assignRole,
    deleteMessageAdmin,
    updateModerationFlag,
    checkAdminAccess,
  };
}
