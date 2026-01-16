-- ================================
-- RBAC System for Admin Panel
-- ================================

-- Create app_role enum for roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'moderator', 'support', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Create admin_permissions table
CREATE TABLE public.admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role app_role NOT NULL,
    permission TEXT NOT NULL,
    allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (role, permission)
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    action TEXT NOT NULL,
    target_id UUID,
    target_type TEXT,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create moderation_flags table for AI moderation
CREATE TABLE public.moderation_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID,
    flag_type TEXT NOT NULL, -- spam, toxic, nsfw, other
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    ai_confidence NUMERIC(5,2),
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, escalated
    reviewed_by UUID,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add is_banned column to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS banned_by UUID,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS last_ip TEXT,
ADD COLUMN IF NOT EXISTS last_user_agent TEXT;

-- Add pinned_message_id to chats for message pinning
ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS pinned_message_id UUID REFERENCES public.messages(id);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_flags ENABLE ROW LEVEL SECURITY;

-- ================================
-- Security Definer Function for Role Check
-- ================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Check if user has admin access (admin, moderator, or super_admin)
CREATE OR REPLACE FUNCTION public.has_admin_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'moderator')
  )
$$;

-- Get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles 
     WHERE user_id = _user_id 
     ORDER BY 
       CASE role 
         WHEN 'super_admin' THEN 1 
         WHEN 'admin' THEN 2 
         WHEN 'moderator' THEN 3 
         WHEN 'support' THEN 4 
         WHEN 'user' THEN 5 
       END 
     LIMIT 1),
    'user'::app_role
  )
$$;

-- ================================
-- RLS Policies for user_roles
-- ================================
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_admin_access(auth.uid()));

CREATE POLICY "Super admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ================================
-- RLS Policies for admin_permissions
-- ================================
CREATE POLICY "Admins can view permissions"
ON public.admin_permissions FOR SELECT
TO authenticated
USING (public.has_admin_access(auth.uid()));

CREATE POLICY "Super admins can manage permissions"
ON public.admin_permissions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- ================================
-- RLS Policies for audit_logs
-- ================================
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.has_admin_access(auth.uid()));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_admin_access(auth.uid()));

-- ================================
-- RLS Policies for moderation_flags
-- ================================
CREATE POLICY "Admins can view moderation flags"
ON public.moderation_flags FOR SELECT
TO authenticated
USING (public.has_admin_access(auth.uid()));

CREATE POLICY "Admins can manage moderation flags"
ON public.moderation_flags FOR ALL
TO authenticated
USING (public.has_admin_access(auth.uid()))
WITH CHECK (public.has_admin_access(auth.uid()));

-- ================================
-- Insert default permissions
-- ================================
INSERT INTO public.admin_permissions (role, permission, allowed) VALUES
('super_admin', 'manage_users', true),
('super_admin', 'manage_roles', true),
('super_admin', 'view_messages', true),
('super_admin', 'delete_messages', true),
('super_admin', 'ban_users', true),
('super_admin', 'view_analytics', true),
('super_admin', 'view_audit_logs', true),
('super_admin', 'moderate_content', true),
('admin', 'manage_users', true),
('admin', 'view_messages', true),
('admin', 'delete_messages', true),
('admin', 'ban_users', true),
('admin', 'view_analytics', true),
('admin', 'moderate_content', true),
('moderator', 'view_messages', true),
('moderator', 'delete_messages', true),
('moderator', 'moderate_content', true),
('support', 'view_messages', true);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.moderation_flags;