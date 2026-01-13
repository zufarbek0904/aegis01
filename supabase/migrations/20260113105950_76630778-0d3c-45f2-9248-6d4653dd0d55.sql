-- =====================================================
-- MESSENGER PRO - ПОЛНАЯ СХЕМА БАЗЫ ДАННЫХ
-- =====================================================

-- Enum типы
CREATE TYPE public.presence_status AS ENUM ('online', 'recently', 'offline', 'invisible');
CREATE TYPE public.message_status AS ENUM ('sending', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE public.message_type AS ENUM ('text', 'photo', 'video', 'voice', 'video_message', 'file', 'music', 'location');
CREATE TYPE public.chat_type AS ENUM ('private', 'group', 'channel');
CREATE TYPE public.member_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE public.call_status AS ENUM ('ringing', 'connecting', 'active', 'ended', 'missed', 'declined');
CREATE TYPE public.call_type AS ENUM ('audio', 'video');

-- =====================================================
-- 1. ПРОФИЛИ ПОЛЬЗОВАТЕЛЕЙ
-- =====================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    presence presence_status DEFAULT 'offline',
    last_seen TIMESTAMPTZ DEFAULT now(),
    
    -- Настройки приватности
    show_online_status BOOLEAN DEFAULT true,
    show_last_seen BOOLEAN DEFAULT true,
    show_read_receipts BOOLEAN DEFAULT true,
    allow_calls_from TEXT DEFAULT 'everyone', -- 'everyone', 'contacts', 'nobody'
    allow_messages_from TEXT DEFAULT 'everyone',
    
    -- Уведомления
    notifications_enabled BOOLEAN DEFAULT true,
    sound_enabled BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Профили видны всем авторизованным
CREATE POLICY "Profiles viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- Пользователь может редактировать только свой профиль
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Триггер создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'username',
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'username'),
        NEW.raw_user_meta_data ->> 'avatar_url'
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 2. ЧАТЫ (личные, группы, каналы)
-- =====================================================
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type chat_type NOT NULL DEFAULT 'private',
    name TEXT, -- для групп и каналов
    description TEXT,
    avatar_url TEXT,
    
    -- Настройки группы/канала
    is_public BOOLEAN DEFAULT false,
    invite_link TEXT UNIQUE,
    slow_mode_seconds INTEGER DEFAULT 0,
    members_can_add_members BOOLEAN DEFAULT true,
    
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. УЧАСТНИКИ ЧАТОВ
-- =====================================================
CREATE TABLE public.chat_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role member_role DEFAULT 'member',
    
    -- Настройки участника
    is_muted BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    notifications_enabled BOOLEAN DEFAULT true,
    unread_count INTEGER DEFAULT 0,
    
    joined_at TIMESTAMPTZ DEFAULT now(),
    last_read_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(chat_id, user_id)
);

ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;

-- Пользователь видит только чаты, в которых состоит
CREATE POLICY "Users can view chats they belong to"
    ON public.chats FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_members
            WHERE chat_members.chat_id = chats.id
            AND chat_members.user_id = auth.uid()
        )
        OR is_public = true
    );

-- Пользователь может создавать чаты
CREATE POLICY "Users can create chats"
    ON public.chats FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Админы могут обновлять чаты
CREATE POLICY "Admins can update chats"
    ON public.chats FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_members
            WHERE chat_members.chat_id = chats.id
            AND chat_members.user_id = auth.uid()
            AND chat_members.role IN ('owner', 'admin')
        )
    );

-- Политики для участников чата
CREATE POLICY "Users can view own memberships"
    ON public.chat_members FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.chat_members cm
            WHERE cm.chat_id = chat_members.chat_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join public chats or be added"
    ON public.chat_members FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.chat_members cm
            WHERE cm.chat_id = chat_members.chat_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can update own membership"
    ON public.chat_members FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can remove members"
    ON public.chat_members FOR DELETE
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.chat_members cm
            WHERE cm.chat_id = chat_members.chat_id
            AND cm.user_id = auth.uid()
            AND cm.role IN ('owner', 'admin')
        )
    );

-- =====================================================
-- 4. СООБЩЕНИЯ
-- =====================================================
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    content TEXT,
    type message_type DEFAULT 'text',
    status message_status DEFAULT 'sending',
    
    -- Медиа
    media_url TEXT,
    media_thumbnail_url TEXT,
    media_duration INTEGER, -- секунды для аудио/видео
    media_size INTEGER, -- байты
    file_name TEXT,
    
    -- Специальные типы
    is_one_time BOOLEAN DEFAULT false,
    is_viewed BOOLEAN DEFAULT false,
    
    -- Отложенная отправка
    scheduled_for TIMESTAMPTZ,
    is_scheduled BOOLEAN DEFAULT false,
    
    -- Reply и Forward
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    forwarded_from_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    
    -- Редактирование
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    
    -- Удаление
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Индексы для производительности
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_messages_scheduled ON public.messages(scheduled_for) WHERE is_scheduled = true;

-- Политики для сообщений
CREATE POLICY "Users can view messages in their chats"
    ON public.messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_members
            WHERE chat_members.chat_id = messages.chat_id
            AND chat_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their chats"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.chat_members
            WHERE chat_members.chat_id = messages.chat_id
            AND chat_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own messages"
    ON public.messages FOR UPDATE
    TO authenticated
    USING (sender_id = auth.uid());

CREATE POLICY "Users can delete own messages"
    ON public.messages FOR DELETE
    TO authenticated
    USING (sender_id = auth.uid());

-- =====================================================
-- 5. СТАТУСЫ ПРОЧТЕНИЯ
-- =====================================================
CREATE TABLE public.message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(message_id, user_id)
);

ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reads in their chats"
    ON public.message_reads FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.chat_members cm ON cm.chat_id = m.chat_id
            WHERE m.id = message_reads.message_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can mark messages as read"
    ON public.message_reads FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 6. TYPING INDICATORS (Realtime)
-- =====================================================
CREATE TABLE public.typing_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT DEFAULT 'typing',
    started_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(chat_id, user_id)
);

ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view typing in their chats"
    ON public.typing_indicators FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_members
            WHERE chat_members.chat_id = typing_indicators.chat_id
            AND chat_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can set own typing"
    ON public.typing_indicators FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own typing"
    ON public.typing_indicators FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own typing"
    ON public.typing_indicators FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- =====================================================
-- 7. ЗВОНКИ (WebRTC)
-- =====================================================
CREATE TABLE public.calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    caller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type call_type DEFAULT 'audio',
    status call_status DEFAULT 'ringing',
    
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration INTEGER, -- секунды
    
    -- WebRTC сигналы хранятся временно
    offer JSONB,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.call_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    
    is_muted BOOLEAN DEFAULT false,
    is_video_enabled BOOLEAN DEFAULT true,
    is_screen_sharing BOOLEAN DEFAULT false,
    
    -- ICE кандидаты
    ice_candidates JSONB DEFAULT '[]',
    answer JSONB,
    
    UNIQUE(call_id, user_id)
);

ALTER TABLE public.call_participants ENABLE ROW LEVEL SECURITY;

-- Политики для звонков
CREATE POLICY "Users can view calls in their chats"
    ON public.calls FOR SELECT
    TO authenticated
    USING (
        caller_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.chat_members
            WHERE chat_members.chat_id = calls.chat_id
            AND chat_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create calls"
    ON public.calls FOR INSERT
    TO authenticated
    WITH CHECK (caller_id = auth.uid());

CREATE POLICY "Participants can update calls"
    ON public.calls FOR UPDATE
    TO authenticated
    USING (
        caller_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.call_participants
            WHERE call_participants.call_id = calls.id
            AND call_participants.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view call participants"
    ON public.call_participants FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.calls c
            JOIN public.chat_members cm ON cm.chat_id = c.chat_id
            WHERE c.id = call_participants.call_id
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join calls"
    ON public.call_participants FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own participation"
    ON public.call_participants FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- =====================================================
-- 8. ОТЛОЖЕННЫЕ СООБЩЕНИЯ
-- =====================================================
CREATE TABLE public.scheduled_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    content TEXT,
    type message_type DEFAULT 'text',
    media_url TEXT,
    
    scheduled_for TIMESTAMPTZ NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_scheduled_messages_time ON public.scheduled_messages(scheduled_for) 
    WHERE is_sent = false;

CREATE POLICY "Users can manage own scheduled messages"
    ON public.scheduled_messages FOR ALL
    TO authenticated
    USING (sender_id = auth.uid())
    WITH CHECK (sender_id = auth.uid());

-- =====================================================
-- 9. КОНТАКТЫ
-- =====================================================
CREATE TABLE public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname TEXT,
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(user_id, contact_id)
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contacts"
    ON public.contacts FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 10. ФУНКЦИЯ ОБНОВЛЕНИЯ PRESENCE
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_user_presence(
    p_user_id UUID,
    p_status presence_status
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    UPDATE public.profiles
    SET 
        presence = p_status,
        last_seen = CASE WHEN p_status != 'online' THEN now() ELSE last_seen END,
        updated_at = now()
    WHERE id = p_user_id;
END;
$$;

-- =====================================================
-- 11. ФУНКЦИЯ ПОЛУЧЕНИЯ/СОЗДАНИЯ ПРИВАТНОГО ЧАТА
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_or_create_private_chat(
    p_user_id UUID,
    p_other_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_chat_id UUID;
BEGIN
    -- Ищем существующий приватный чат
    SELECT c.id INTO v_chat_id
    FROM public.chats c
    JOIN public.chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = p_user_id
    JOIN public.chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = p_other_user_id
    WHERE c.type = 'private'
    LIMIT 1;
    
    IF v_chat_id IS NULL THEN
        -- Создаём новый чат
        INSERT INTO public.chats (type, created_by)
        VALUES ('private', p_user_id)
        RETURNING id INTO v_chat_id;
        
        -- Добавляем участников
        INSERT INTO public.chat_members (chat_id, user_id, role)
        VALUES 
            (v_chat_id, p_user_id, 'member'),
            (v_chat_id, p_other_user_id, 'member');
    END IF;
    
    RETURN v_chat_id;
END;
$$;

-- =====================================================
-- 12. REALTIME SUBSCRIPTIONS
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable REPLICA IDENTITY for realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.typing_indicators REPLICA IDENTITY FULL;
ALTER TABLE public.calls REPLICA IDENTITY FULL;
ALTER TABLE public.call_participants REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- =====================================================
-- 13. STORAGE BUCKETS
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('chat-media', 'chat-media', false, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/ogg', 'audio/webm', 'application/pdf', 'application/zip']);

-- Storage policies
CREATE POLICY "Avatars are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Chat media accessible to chat members"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'chat-media'
        AND EXISTS (
            SELECT 1 FROM public.chat_members cm
            WHERE cm.chat_id::text = (storage.foldername(name))[1]
            AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Chat members can upload media"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'chat-media'
        AND EXISTS (
            SELECT 1 FROM public.chat_members cm
            WHERE cm.chat_id::text = (storage.foldername(name))[1]
            AND cm.user_id = auth.uid()
        )
    );