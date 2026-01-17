export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_permissions: {
        Row: {
          allowed: boolean | null
          created_at: string | null
          id: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          allowed?: boolean | null
          created_at?: string | null
          id?: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          allowed?: boolean | null
          created_at?: string | null
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      call_participants: {
        Row: {
          answer: Json | null
          call_id: string
          ice_candidates: Json | null
          id: string
          is_muted: boolean | null
          is_screen_sharing: boolean | null
          is_video_enabled: boolean | null
          joined_at: string | null
          left_at: string | null
          user_id: string
        }
        Insert: {
          answer?: Json | null
          call_id: string
          ice_candidates?: Json | null
          id?: string
          is_muted?: boolean | null
          is_screen_sharing?: boolean | null
          is_video_enabled?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          user_id: string
        }
        Update: {
          answer?: Json | null
          call_id?: string
          ice_candidates?: Json | null
          id?: string
          is_muted?: boolean | null
          is_screen_sharing?: boolean | null
          is_video_enabled?: boolean | null
          joined_at?: string | null
          left_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_participants_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "calls"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          caller_id: string
          chat_id: string
          created_at: string | null
          duration: number | null
          ended_at: string | null
          id: string
          offer: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["call_status"] | null
          type: Database["public"]["Enums"]["call_type"] | null
        }
        Insert: {
          caller_id: string
          chat_id: string
          created_at?: string | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          offer?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["call_status"] | null
          type?: Database["public"]["Enums"]["call_type"] | null
        }
        Update: {
          caller_id?: string
          chat_id?: string
          created_at?: string | null
          duration?: number | null
          ended_at?: string | null
          id?: string
          offer?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["call_status"] | null
          type?: Database["public"]["Enums"]["call_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "calls_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_members: {
        Row: {
          chat_id: string
          id: string
          is_muted: boolean | null
          is_pinned: boolean | null
          joined_at: string | null
          last_read_at: string | null
          notifications_enabled: boolean | null
          role: Database["public"]["Enums"]["member_role"] | null
          unread_count: number | null
          user_id: string
        }
        Insert: {
          chat_id: string
          id?: string
          is_muted?: boolean | null
          is_pinned?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          notifications_enabled?: boolean | null
          role?: Database["public"]["Enums"]["member_role"] | null
          unread_count?: number | null
          user_id: string
        }
        Update: {
          chat_id?: string
          id?: string
          is_muted?: boolean | null
          is_pinned?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          notifications_enabled?: boolean | null
          role?: Database["public"]["Enums"]["member_role"] | null
          unread_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          invite_link: string | null
          is_public: boolean | null
          members_can_add_members: boolean | null
          name: string | null
          pinned_message_id: string | null
          slow_mode_seconds: number | null
          type: Database["public"]["Enums"]["chat_type"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          invite_link?: string | null
          is_public?: boolean | null
          members_can_add_members?: boolean | null
          name?: string | null
          pinned_message_id?: string | null
          slow_mode_seconds?: number | null
          type?: Database["public"]["Enums"]["chat_type"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          invite_link?: string | null
          is_public?: boolean | null
          members_can_add_members?: boolean | null
          name?: string | null
          pinned_message_id?: string | null
          slow_mode_seconds?: number | null
          type?: Database["public"]["Enums"]["chat_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_pinned_message_id_fkey"
            columns: ["pinned_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          contact_id: string
          created_at: string | null
          id: string
          is_blocked: boolean | null
          nickname: string | null
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          id?: string
          is_blocked?: boolean | null
          nickname?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          id?: string
          is_blocked?: boolean | null
          nickname?: string | null
          user_id?: string
        }
        Relationships: []
      }
      message_reads: {
        Row: {
          id: string
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string | null
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          file_name: string | null
          forwarded_from_id: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          is_one_time: boolean | null
          is_scheduled: boolean | null
          is_viewed: boolean | null
          media_duration: number | null
          media_size: number | null
          media_thumbnail_url: string | null
          media_url: string | null
          reply_to_id: string | null
          scheduled_for: string | null
          sender_id: string
          status: Database["public"]["Enums"]["message_status"] | null
          type: Database["public"]["Enums"]["message_type"] | null
          updated_at: string | null
        }
        Insert: {
          chat_id: string
          content?: string | null
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          file_name?: string | null
          forwarded_from_id?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_one_time?: boolean | null
          is_scheduled?: boolean | null
          is_viewed?: boolean | null
          media_duration?: number | null
          media_size?: number | null
          media_thumbnail_url?: string | null
          media_url?: string | null
          reply_to_id?: string | null
          scheduled_for?: string | null
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"] | null
          type?: Database["public"]["Enums"]["message_type"] | null
          updated_at?: string | null
        }
        Update: {
          chat_id?: string
          content?: string | null
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          file_name?: string | null
          forwarded_from_id?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          is_one_time?: boolean | null
          is_scheduled?: boolean | null
          is_viewed?: boolean | null
          media_duration?: number | null
          media_size?: number | null
          media_thumbnail_url?: string | null
          media_url?: string | null
          reply_to_id?: string | null
          scheduled_for?: string | null
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"] | null
          type?: Database["public"]["Enums"]["message_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_forwarded_from_id_fkey"
            columns: ["forwarded_from_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_flags: {
        Row: {
          ai_confidence: number | null
          created_at: string | null
          flag_type: string
          id: string
          message_id: string | null
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          ai_confidence?: number | null
          created_at?: string | null
          flag_type: string
          id?: string
          message_id?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          ai_confidence?: number | null
          created_at?: string | null
          flag_type?: string
          id?: string
          message_id?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_flags_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          allow_calls_from: string | null
          allow_messages_from: string | null
          avatar_url: string | null
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_banned: boolean | null
          last_ip: string | null
          last_seen: string | null
          last_user_agent: string | null
          notifications_enabled: boolean | null
          presence: Database["public"]["Enums"]["presence_status"] | null
          show_last_seen: boolean | null
          show_online_status: boolean | null
          show_read_receipts: boolean | null
          sound_enabled: boolean | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          allow_calls_from?: string | null
          allow_messages_from?: string | null
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          is_banned?: boolean | null
          last_ip?: string | null
          last_seen?: string | null
          last_user_agent?: string | null
          notifications_enabled?: boolean | null
          presence?: Database["public"]["Enums"]["presence_status"] | null
          show_last_seen?: boolean | null
          show_online_status?: boolean | null
          show_read_receipts?: boolean | null
          sound_enabled?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          allow_calls_from?: string | null
          allow_messages_from?: string | null
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_banned?: boolean | null
          last_ip?: string | null
          last_seen?: string | null
          last_user_agent?: string | null
          notifications_enabled?: boolean | null
          presence?: Database["public"]["Enums"]["presence_status"] | null
          show_last_seen?: boolean | null
          show_online_status?: boolean | null
          show_read_receipts?: boolean | null
          sound_enabled?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      scheduled_messages: {
        Row: {
          chat_id: string
          content: string | null
          created_at: string | null
          id: string
          is_sent: boolean | null
          media_url: string | null
          scheduled_for: string
          sender_id: string
          sent_at: string | null
          type: Database["public"]["Enums"]["message_type"] | null
        }
        Insert: {
          chat_id: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          media_url?: string | null
          scheduled_for: string
          sender_id: string
          sent_at?: string | null
          type?: Database["public"]["Enums"]["message_type"] | null
        }
        Update: {
          chat_id?: string
          content?: string | null
          created_at?: string | null
          id?: string
          is_sent?: boolean | null
          media_url?: string | null
          scheduled_for?: string
          sender_id?: string
          sent_at?: string | null
          type?: Database["public"]["Enums"]["message_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_indicators: {
        Row: {
          activity_type: string | null
          chat_id: string
          id: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          chat_id: string
          id?: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string | null
          chat_id?: string
          id?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_group_chat: {
        Args: {
          p_description?: string
          p_is_public?: boolean
          p_member_ids?: string[]
          p_name: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      get_or_create_private_chat: {
        Args: { p_other_user_id: string; p_user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_admin_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_chat_admin: {
        Args: { p_chat_id: string; p_user_id: string }
        Returns: boolean
      }
      update_user_presence: {
        Args: {
          p_status: Database["public"]["Enums"]["presence_status"]
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "support" | "user"
      call_status:
        | "ringing"
        | "connecting"
        | "active"
        | "ended"
        | "missed"
        | "declined"
      call_type: "audio" | "video"
      chat_type: "private" | "group" | "channel"
      member_role: "owner" | "admin" | "member" | "viewer"
      message_status: "sending" | "sent" | "delivered" | "read" | "failed"
      message_type:
        | "text"
        | "photo"
        | "video"
        | "voice"
        | "video_message"
        | "file"
        | "music"
        | "location"
      presence_status: "online" | "recently" | "offline" | "invisible"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "moderator", "support", "user"],
      call_status: [
        "ringing",
        "connecting",
        "active",
        "ended",
        "missed",
        "declined",
      ],
      call_type: ["audio", "video"],
      chat_type: ["private", "group", "channel"],
      member_role: ["owner", "admin", "member", "viewer"],
      message_status: ["sending", "sent", "delivered", "read", "failed"],
      message_type: [
        "text",
        "photo",
        "video",
        "voice",
        "video_message",
        "file",
        "music",
        "location",
      ],
      presence_status: ["online", "recently", "offline", "invisible"],
    },
  },
} as const
