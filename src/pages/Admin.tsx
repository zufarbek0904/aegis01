import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin, AppRole } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  MessageSquare, 
  Shield, 
  Activity, 
  Settings,
  Search,
  Ban,
  Trash2,
  Eye,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  FileText,
  Loader2,
  UserCog,
  Flag,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/messenger/Avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const {
    isAdmin,
    userRole,
    loading: adminLoading,
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
    updateModerationFlag,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole>('user');
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<any>(null);
  const [flagNotes, setFlagNotes] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchAuditLogs();
      fetchModerationFlags();
      fetchStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      const debounce = setTimeout(() => {
        fetchUsers(searchQuery);
      }, 300);
      return () => clearTimeout(debounce);
    }
  }, [searchQuery, isAdmin]);

  if (authLoading || adminLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Доступ запрещён</h1>
          <p className="text-muted-foreground mb-4">У вас нет прав для доступа к админ-панели</p>
          <Button onClick={() => window.location.href = '/'}>На главную</Button>
        </div>
      </div>
    );
  }

  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) return;
    
    const success = await banUser(selectedUser.id, banReason);
    if (success) {
      toast.success('Пользователь заблокирован');
      setBanDialogOpen(false);
      setBanReason('');
      setSelectedUser(null);
    } else {
      toast.error('Ошибка при блокировке');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    const success = await unbanUser(userId);
    if (success) {
      toast.success('Пользователь разблокирован');
    } else {
      toast.error('Ошибка при разблокировке');
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser) return;
    
    const success = await assignRole(selectedUser.id, selectedRole);
    if (success) {
      toast.success('Роль назначена');
      setRoleDialogOpen(false);
      setSelectedUser(null);
    } else {
      toast.error('Ошибка при назначении роли');
    }
  };

  const handleUpdateFlag = async (status: string) => {
    if (!selectedFlag) return;
    
    const success = await updateModerationFlag(selectedFlag.id, status, flagNotes);
    if (success) {
      toast.success('Статус обновлён');
      setFlagDialogOpen(false);
      setSelectedFlag(null);
      setFlagNotes('');
    } else {
      toast.error('Ошибка при обновлении');
    }
  };

  const getRoleBadge = (role: AppRole) => {
    const colors: Record<AppRole, string> = {
      super_admin: 'bg-red-500',
      admin: 'bg-orange-500',
      moderator: 'bg-blue-500',
      support: 'bg-green-500',
      user: 'bg-gray-500',
    };
    return <Badge className={`${colors[role]} text-white`}>{role}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500',
    };
    return <Badge className={`${colors[severity] || 'bg-gray-500'} text-white`}>{severity}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: any }> = {
      pending: { color: 'bg-yellow-500', icon: Clock },
      approved: { color: 'bg-green-500', icon: CheckCircle },
      rejected: { color: 'bg-red-500', icon: XCircle },
      escalated: { color: 'bg-orange-500', icon: AlertTriangle },
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Админ-панель</h1>
              <p className="text-sm text-muted-foreground">{getRoleBadge(userRole)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Вернуться в мессенджер
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                    <p className="text-xs text-muted-foreground">Всего пользователей</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.onlineUsers}</p>
                    <p className="text-xs text-muted-foreground">Онлайн</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalMessages}</p>
                    <p className="text-xs text-muted-foreground">Сообщений</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Flag className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.flaggedMessages}</p>
                    <p className="text-xs text-muted-foreground">На модерации</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Ban className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.bannedUsers}</p>
                    <p className="text-xs text-muted-foreground">Заблокировано</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Пользователи</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Flag className="w-4 h-4" />
              <span className="hidden md:inline">Модерация</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">Логи</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Аналитика</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Управление пользователями</CardTitle>
                <Button variant="outline" size="sm" onClick={() => fetchUsers(searchQuery)}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Обновить
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск по username или имени..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          u.profile?.is_banned ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' : 'hover:bg-accent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={u.profile?.avatar_url || ''}
                            name={u.profile?.display_name || u.profile?.username || 'User'}
                            size="md"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {u.profile?.display_name || u.profile?.username || 'Пользователь'}
                              </span>
                              {getRoleBadge(u.role)}
                              {u.profile?.is_banned && (
                                <Badge variant="destructive">Заблокирован</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              @{u.profile?.username || 'unknown'} • ID: {u.id.slice(0, 8)}...
                            </p>
                            {u.profile?.is_banned && u.profile.ban_reason && (
                              <p className="text-xs text-destructive mt-1">
                                Причина: {u.profile.ban_reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {u.profile?.is_banned ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnbanUser(u.id)}
                            >
                              Разблокировать
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(u);
                                setBanDialogOpen(true);
                              }}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Бан
                            </Button>
                          )}
                          {userRole === 'super_admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(u);
                                setSelectedRole(u.role);
                                setRoleDialogOpen(true);
                              }}
                            >
                              <UserCog className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Очередь модерации</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchModerationFlags}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Обновить
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {moderationFlags.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                      <p className="text-muted-foreground">Нет сообщений на модерации</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {moderationFlags.map((flag) => (
                        <div
                          key={flag.id}
                          className="p-4 rounded-lg border hover:bg-accent cursor-pointer"
                          onClick={() => {
                            setSelectedFlag(flag);
                            setFlagDialogOpen(true);
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{flag.flag_type}</Badge>
                              {getSeverityBadge(flag.severity)}
                              {getStatusBadge(flag.status)}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(flag.created_at), 'dd MMM, HH:mm', { locale: ru })}
                            </span>
                          </div>
                          {flag.message && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {flag.message.content}
                            </p>
                          )}
                          {flag.ai_confidence && (
                            <p className="text-xs text-muted-foreground mt-2">
                              AI уверенность: {flag.ai_confidence}%
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Журнал действий</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchAuditLogs}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Обновить
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg border">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-muted-foreground">
                            Admin: {log.admin_id.slice(0, 8)}... 
                            {log.target_id && ` • Target: ${log.target_id.slice(0, 8)}...`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), 'dd MMM, HH:mm', { locale: ru })}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Аналитика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Расширенная аналитика будет доступна в следующих обновлениях
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Заблокировать пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Вы собираетесь заблокировать пользователя{' '}
              <strong>{selectedUser?.profile?.display_name || selectedUser?.profile?.username}</strong>
            </p>
            <Textarea
              placeholder="Укажите причину блокировки..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleBanUser} disabled={!banReason.trim()}>
              Заблокировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Назначить роль</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Назначение роли для{' '}
              <strong>{selectedUser?.profile?.display_name || selectedUser?.profile?.username}</strong>
            </p>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAssignRole}>Назначить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flag Review Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Проверка сообщения</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedFlag && (
              <>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedFlag.flag_type}</Badge>
                  {getSeverityBadge(selectedFlag.severity)}
                </div>
                {selectedFlag.message && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedFlag.message.content}</p>
                  </div>
                )}
                <Textarea
                  placeholder="Заметки модератора..."
                  value={flagNotes}
                  onChange={(e) => setFlagNotes(e.target.value)}
                />
              </>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setFlagDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={() => handleUpdateFlag('approved')}>
              <Trash2 className="w-4 h-4 mr-1" />
              Удалить
            </Button>
            <Button onClick={() => handleUpdateFlag('rejected')}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Пропустить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
