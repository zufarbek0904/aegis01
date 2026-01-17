-- Create message_reactions table
CREATE TABLE public.message_reactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_reactions
CREATE POLICY "Users can view reactions in their chats"
ON public.message_reactions
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.messages m
        JOIN public.chat_members cm ON cm.chat_id = m.chat_id
        WHERE m.id = message_reactions.message_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can add reactions"
ON public.message_reactions
FOR INSERT
WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.messages m
        JOIN public.chat_members cm ON cm.chat_id = m.chat_id
        WHERE m.id = message_reactions.message_id
        AND cm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can remove own reactions"
ON public.message_reactions
FOR DELETE
USING (user_id = auth.uid());

-- Create support_tickets table
CREATE TABLE public.support_tickets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    priority TEXT NOT NULL DEFAULT 'normal',
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS policies for support_tickets
CREATE POLICY "Users can view own tickets"
ON public.support_tickets
FOR SELECT
USING (user_id = auth.uid() OR has_admin_access(auth.uid()));

CREATE POLICY "Users can create tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update tickets"
ON public.support_tickets
FOR UPDATE
USING (has_admin_access(auth.uid()));

-- Create support_messages table
CREATE TABLE public.support_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_from_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for support_messages
CREATE POLICY "Users can view messages on own tickets"
ON public.support_messages
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets t
        WHERE t.id = support_messages.ticket_id
        AND (t.user_id = auth.uid() OR has_admin_access(auth.uid()))
    )
);

CREATE POLICY "Users can send messages on own tickets"
ON public.support_messages
FOR INSERT
WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM public.support_tickets t
        WHERE t.id = support_messages.ticket_id
        AND (t.user_id = auth.uid() OR has_admin_access(auth.uid()))
    )
);

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;