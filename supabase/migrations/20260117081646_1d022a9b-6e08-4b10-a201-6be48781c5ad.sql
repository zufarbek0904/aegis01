
-- First create the is_chat_admin helper function
CREATE OR REPLACE FUNCTION public.is_chat_admin(p_chat_id uuid, p_user_id uuid)
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
    AND role IN ('owner', 'admin')
  );
$$;

-- Now fix the RLS policy for chat_members INSERT
DROP POLICY IF EXISTS "Users can join public chats or be added" ON public.chat_members;

CREATE POLICY "Users can be added to chats" ON public.chat_members
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.chats c
    WHERE c.id = chat_id AND c.created_by = auth.uid()
  )
  OR public.is_chat_admin(chat_id, auth.uid())
);

-- Update get_or_create_private_chat function to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_or_create_private_chat(p_user_id uuid, p_other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_chat_id UUID;
BEGIN
    SELECT c.id INTO v_chat_id
    FROM public.chats c
    JOIN public.chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = p_user_id
    JOIN public.chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = p_other_user_id
    WHERE c.type = 'private'
    LIMIT 1;
    
    IF v_chat_id IS NULL THEN
        INSERT INTO public.chats (type, created_by)
        VALUES ('private', p_user_id)
        RETURNING id INTO v_chat_id;
        
        INSERT INTO public.chat_members (chat_id, user_id, role)
        VALUES 
            (v_chat_id, p_user_id, 'member'),
            (v_chat_id, p_other_user_id, 'member');
    END IF;
    
    RETURN v_chat_id;
END;
$$;

-- Create helper function for creating groups/channels
CREATE OR REPLACE FUNCTION public.create_group_chat(
    p_user_id uuid,
    p_name text,
    p_type text DEFAULT 'group',
    p_description text DEFAULT NULL,
    p_is_public boolean DEFAULT false,
    p_member_ids uuid[] DEFAULT '{}'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_chat_id UUID;
    v_member_id UUID;
    v_member_role member_role;
BEGIN
    INSERT INTO public.chats (type, name, description, is_public, created_by)
    VALUES (p_type::chat_type, p_name, p_description, p_is_public, p_user_id)
    RETURNING id INTO v_chat_id;
    
    INSERT INTO public.chat_members (chat_id, user_id, role)
    VALUES (v_chat_id, p_user_id, 'owner');
    
    v_member_role := CASE WHEN p_type = 'channel' THEN 'viewer' ELSE 'member' END;
    
    FOREACH v_member_id IN ARRAY p_member_ids
    LOOP
        INSERT INTO public.chat_members (chat_id, user_id, role)
        VALUES (v_chat_id, v_member_id, v_member_role);
    END LOOP;
    
    RETURN v_chat_id;
END;
$$;
