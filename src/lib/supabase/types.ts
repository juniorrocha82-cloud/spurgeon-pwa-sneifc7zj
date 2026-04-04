// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      devotionals: {
        Row: {
          base_text: string
          content: Json
          created_at: string
          date: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          base_text: string
          content: Json
          created_at?: string
          date?: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          base_text?: string
          content?: Json
          created_at?: string
          date?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      generation_logs: {
        Row: {
          created_at: string
          id: string
          resource_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resource_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      sermons: {
        Row: {
          base_text: string
          content: Json
          created_at: string
          date: string
          duration: number
          id: string
          insights: Json
          references_list: Json
          sermon_type: string
          title: string
          user_id: string
          version: string
        }
        Insert: {
          base_text: string
          content: Json
          created_at?: string
          date?: string
          duration: number
          id?: string
          insights: Json
          references_list: Json
          sermon_type?: string
          title: string
          user_id: string
          version: string
        }
        Update: {
          base_text?: string
          content?: Json
          created_at?: string
          date?: string
          duration?: number
          id?: string
          insights?: Json
          references_list?: Json
          sermon_type?: string
          title?: string
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          generation_limit: number | null
          id: string
          name: string
          price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          generation_limit?: number | null
          id: string
          name: string
          price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          generation_limit?: number | null
          id?: string
          name?: string
          price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          font_family: string
          id: string
          logo_base64: string | null
          primary_color: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          font_family?: string
          id?: string
          logo_base64?: string | null
          primary_color?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          font_family?: string
          id?: string
          logo_base64?: string | null
          primary_color?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          plan_id: string
          status: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: contact_messages
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   name: text (not null)
//   email: text (not null)
//   subject: text (not null)
//   message: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: devotionals
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   title: text (not null)
//   base_text: text (not null)
//   content: jsonb (not null)
//   date: timestamp with time zone (not null, default: now())
//   created_at: timestamp with time zone (not null, default: now())
// Table: generation_logs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   resource_type: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: sermons
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   title: text (not null)
//   base_text: text (not null)
//   version: text (not null)
//   duration: integer (not null)
//   content: jsonb (not null)
//   insights: jsonb (not null)
//   references_list: jsonb (not null)
//   date: timestamp with time zone (not null, default: now())
//   created_at: timestamp with time zone (not null, default: now())
//   sermon_type: text (not null, default: 'Expositivo'::text)
// Table: subscription_plans
//   id: text (not null)
//   name: text (not null)
//   price_id: text (nullable)
//   generation_limit: integer (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: user_settings
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   primary_color: text (not null, default: '#d97706'::text)
//   font_family: text (not null, default: 'Arial'::text)
//   logo_base64: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: user_subscriptions
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   plan_id: text (not null)
//   status: text (not null)
//   expires_at: timestamp with time zone (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   stripe_subscription_id: text (nullable)

// --- CONSTRAINTS ---
// Table: contact_messages
//   PRIMARY KEY contact_messages_pkey: PRIMARY KEY (id)
//   FOREIGN KEY contact_messages_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: devotionals
//   PRIMARY KEY devotionals_pkey: PRIMARY KEY (id)
//   FOREIGN KEY devotionals_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: generation_logs
//   PRIMARY KEY generation_logs_pkey: PRIMARY KEY (id)
//   FOREIGN KEY generation_logs_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: sermons
//   PRIMARY KEY sermons_pkey: PRIMARY KEY (id)
//   FOREIGN KEY sermons_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: subscription_plans
//   PRIMARY KEY subscription_plans_pkey: PRIMARY KEY (id)
// Table: user_settings
//   PRIMARY KEY user_settings_pkey: PRIMARY KEY (id)
//   FOREIGN KEY user_settings_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
//   UNIQUE user_settings_user_id_key: UNIQUE (user_id)
// Table: user_subscriptions
//   PRIMARY KEY user_subscriptions_pkey: PRIMARY KEY (id)
//   FOREIGN KEY user_subscriptions_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: contact_messages
//   Policy "Users can insert their own messages" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
// Table: devotionals
//   Policy "Users can delete their own devotionals" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "Users can insert their own devotionals" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can update their own devotionals" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can view their own devotionals" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: generation_logs
//   Policy "Users can insert their own generation logs" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can view their own generation logs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: sermons
//   Policy "Users can delete their own sermons" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "Users can insert their own sermons" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can update their own sermons" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "Users can view their own sermons" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: subscription_plans
//   Policy "Allow read access to all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: user_settings
//   Policy "Users can insert their own settings" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can select their own settings" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "Users can update their own settings" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: user_subscriptions
//   Policy "Users can view their own subscriptions" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)

// --- INDEXES ---
// Table: user_settings
//   CREATE UNIQUE INDEX user_settings_user_id_key ON public.user_settings USING btree (user_id)
