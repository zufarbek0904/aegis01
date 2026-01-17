
-- Drop all existing policies for chat_members to start fresh
DROP POLICY IF EXISTS "Users can view own memberships" ON public.chat_members;
DROP POLICY IF EXISTS "Users can be added to chats" ON public.chat_members;
DROP POLICY IF EXISTS "Users can update own membership" ON public.chat_members;
DROP POLICY IF EXISTS "Admins can remove members" ON public.chat_members;

-- Create security definer function for checking chat membership
CREATE OR REPLACE FUNCTION public.is_chat_member(p_chat_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_members
    WHERE chat_id = p_chat_id
    AND user_id = p_user_id
  );
$$;

-- Create new non-recursive policies using the security definer function

-- SELECT: Users can view memberships if they're the user or a member of the chat
CREATE POLICY "chat_members_select_policy" ON public.chat_members
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR public.is_chat_member(chat_id, auth.uid())
);

-- INSERT: Users can be added if they're adding themselves, they created the chat, or they're admin
CREATE POLICY "chat_members_insert_policy" ON public.chat_members
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.chats c
    WHERE c.id = chat_id AND c.created_by = auth.uid()
  )
  OR public.is_chat_admin(chat_id, auth.uid())
);

-- UPDATE: Users can only update their own membership
CREATE POLICY "chat_members_update_policy" ON public.chat_members
FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- DELETE: Users can leave (delete own) or admins can remove members
CREATE POLICY "chat_members_delete_policy" ON public.chat_members
FOR DELETE TO authenticated
USING (
  user_id = auth.uid() 
  OR public.is_chat_admin(chat_id, auth.uid())
);
