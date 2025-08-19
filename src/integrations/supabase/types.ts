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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          password_hash: string | null
          created_at: string
          updated_at: string
          last_login: string | null
          is_active: boolean
          failed_attempts: number
          locked_until: string | null
        }
        Insert: {
          id?: string
          email: string
          username: string
          password_hash?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
          failed_attempts?: number
          locked_until?: string | null
        }
        Update: {
          id?: string
          email?: string
          username?: string
          password_hash?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
          failed_attempts?: number
          locked_until?: string | null
        }
      }
      biometric_credentials: {
        Row: {
          id: string
          user_id: string
          credential_id: string
          public_key: string
          sign_count: number
          transports: string[]
          created_at: string
          last_used: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          credential_id: string
          public_key: string
          sign_count?: number
          transports?: string[]
          created_at?: string
          last_used?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          credential_id?: string
          public_key?: string
          sign_count?: number
          transports?: string[]
          created_at?: string
          last_used?: string | null
          is_active?: boolean
        }
      }
      authentication_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          created_at: string
          expires_at: string
          is_active: boolean
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          created_at?: string
          expires_at: string
          is_active?: boolean
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          created_at?: string
          expires_at?: string
          is_active?: boolean
          ip_address?: string | null
          user_agent?: string | null
        }
      }
      webauthn_challenges: {
        Row: {
          id: string
          user_id: string
          challenge: string
          challenge_type: 'registration' | 'authentication'
          created_at: string
          expires_at: string
          is_used: boolean
        }
        Insert: {
          id?: string
          user_id: string
          challenge: string
          challenge_type: 'registration' | 'authentication'
          created_at?: string
          expires_at: string
          is_used?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          challenge?: string
          challenge_type?: 'registration' | 'authentication'
          created_at?: string
          expires_at?: string
          is_used?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      challenge_type: 'registration' | 'authentication'
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
        DefaultSchema[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DefaultSchema[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DefaultSchema[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[TableName] extends {
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
    schema: keyof DefaultSchema["Tables"]
  }
    ? keyof DefaultSchema["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DefaultSchema[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][TableName] extends {
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
    schema: keyof DefaultSchema["Tables"]
  }
    ? keyof DefaultSchema["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DefaultSchema[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][TableName] extends {
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
    ? keyof DefaultSchema["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DefaultSchema[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][EnumName]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DefaultSchema["CompositeTypes"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DefaultSchema[DefaultSchemaTableNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][CompositeTypeName]
    : never

export const Constants = {
  public: {
    Enums: {
      challenge_type: ['registration', 'authentication'] as const,
    },
  },
} as const
