// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      api_providers: {
        Row: {
          api_key: string | null
          created_at: string
          endpoint: string | null
          id: string
          is_active: boolean
          priority: number
          provider_name: string
          rate_limit: number | null
          updated_at: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          endpoint?: string | null
          id?: string
          is_active?: boolean
          priority: number
          provider_name: string
          rate_limit?: number | null
          updated_at?: string
        }
        Update: {
          api_key?: string | null
          created_at?: string
          endpoint?: string | null
          id?: string
          is_active?: boolean
          priority?: number
          provider_name?: string
          rate_limit?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      bible_books: {
        Row: {
          abbreviation: string
          book_number: number
          chapters_count: number
          created_at: string | null
          id: string
          name: string
          testament: string
          version_id: string
        }
        Insert: {
          abbreviation: string
          book_number: number
          chapters_count: number
          created_at?: string | null
          id?: string
          name: string
          testament: string
          version_id: string
        }
        Update: {
          abbreviation?: string
          book_number?: number
          chapters_count?: number
          created_at?: string | null
          id?: string
          name?: string
          testament?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bible_books_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "bible_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_chapters: {
        Row: {
          book_id: string
          chapter_number: number
          created_at: string | null
          id: string
          verses_count: number
        }
        Insert: {
          book_id: string
          chapter_number: number
          created_at?: string | null
          id?: string
          verses_count: number
        }
        Update: {
          book_id?: string
          chapter_number?: number
          created_at?: string | null
          id?: string
          verses_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "bible_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "bible_books"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_verses: {
        Row: {
          chapter_id: string
          created_at: string | null
          id: string
          text: string
          verse_number: number
        }
        Insert: {
          chapter_id: string
          created_at?: string | null
          id?: string
          text: string
          verse_number: number
        }
        Update: {
          chapter_id?: string
          created_at?: string | null
          id?: string
          text?: string
          verse_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "bible_verses_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "bible_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_versions: {
        Row: {
          abbreviation: string
          created_at: string | null
          id: string
          language: string | null
          name: string
        }
        Insert: {
          abbreviation: string
          created_at?: string | null
          id?: string
          language?: string | null
          name: string
        }
        Update: {
          abbreviation?: string
          created_at?: string | null
          id?: string
          language?: string | null
          name?: string
        }
        Relationships: []
      }
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
      devotional_limits: {
        Row: {
          count: number
          created_at: string
          date: string
          id: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          date: string
          id?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      devotionals: {
        Row: {
          base_text: string
          content: Json
          created_at: string
          date: string
          devotional_date: string | null
          devotional_text: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          base_text: string
          content: Json
          created_at?: string
          date?: string
          devotional_date?: string | null
          devotional_text?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          base_text?: string
          content?: Json
          created_at?: string
          date?: string
          devotional_date?: string | null
          devotional_text?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          status: string
          subject: string
          to_email: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          status: string
          subject: string
          to_email: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          status?: string
          subject?: string
          to_email?: string
        }
        Relationships: []
      }
      gemini_cache: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          prompt_hash: string
          response: Json
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          prompt_hash: string
          response: Json
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          prompt_hash?: string
          response?: Json
        }
        Relationships: []
      }
      generation_logs: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          provider_used: string | null
          resource_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          provider_used?: string | null
          resource_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          provider_used?: string | null
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
          custom_outline: string | null
          date: string
          duration: number
          id: string
          insights: Json
          references_list: Json
          sermon_type: string
          title: string
          use_custom_outline: boolean | null
          user_id: string
          version: string
        }
        Insert: {
          base_text: string
          content: Json
          created_at?: string
          custom_outline?: string | null
          date?: string
          duration: number
          id?: string
          insights: Json
          references_list: Json
          sermon_type?: string
          title: string
          use_custom_outline?: boolean | null
          user_id: string
          version: string
        }
        Update: {
          base_text?: string
          content?: Json
          created_at?: string
          custom_outline?: string | null
          date?: string
          duration?: number
          id?: string
          insights?: Json
          references_list?: Json
          sermon_type?: string
          title?: string
          use_custom_outline?: boolean | null
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: Json | null
          generation_limit: number | null
          id: string
          name: string
          price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json | null
          generation_limit?: number | null
          id: string
          name: string
          price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json | null
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
          language: string
          logo_base64: string | null
          primary_color: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          font_family?: string
          id?: string
          language?: string
          logo_base64?: string | null
          primary_color?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          font_family?: string
          id?: string
          language?: string
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
          sermons_generated: number | null
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          usage_reset_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          plan_id: string
          sermons_generated?: number | null
          status: string
          stripe_subscription_id?: string | null
          updated_at?: string
          usage_reset_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          plan_id?: string
          sermons_generated?: number | null
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          usage_reset_at?: string | null
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
// Table: api_providers
//   id: uuid (not null, default: gen_random_uuid())
//   provider_name: text (not null)
//   api_key: text (nullable)
//   endpoint: text (nullable)
//   rate_limit: integer (nullable)
//   priority: integer (not null)
//   is_active: boolean (not null, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: bible_books
//   id: uuid (not null, default: gen_random_uuid())
//   version_id: uuid (not null)
//   book_number: integer (not null)
//   name: text (not null)
//   abbreviation: text (not null)
//   testament: text (not null)
//   chapters_count: integer (not null)
//   created_at: timestamp without time zone (nullable, default: now())
// Table: bible_chapters
//   id: uuid (not null, default: gen_random_uuid())
//   book_id: uuid (not null)
//   chapter_number: integer (not null)
//   verses_count: integer (not null)
//   created_at: timestamp without time zone (nullable, default: now())
// Table: bible_verses
//   id: uuid (not null, default: gen_random_uuid())
//   chapter_id: uuid (not null)
//   verse_number: integer (not null)
//   text: text (not null)
//   created_at: timestamp without time zone (nullable, default: now())
// Table: bible_versions
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   abbreviation: text (not null)
//   language: text (nullable, default: 'pt-BR'::text)
//   created_at: timestamp without time zone (nullable, default: now())
// Table: contact_messages
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   name: text (not null)
//   email: text (not null)
//   subject: text (not null)
//   message: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: devotional_limits
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   date: date (not null)
//   count: integer (not null, default: 0)
//   created_at: timestamp with time zone (not null, default: now())
// Table: devotionals
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   title: text (not null)
//   base_text: text (not null)
//   content: jsonb (not null)
//   date: timestamp with time zone (not null, default: now())
//   created_at: timestamp with time zone (not null, default: now())
//   devotional_text: text (nullable)
//   devotional_date: date (nullable)
// Table: email_logs
//   id: uuid (not null, default: gen_random_uuid())
//   to_email: text (not null)
//   subject: text (not null)
//   status: text (not null)
//   error_message: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: gemini_cache
//   id: uuid (not null, default: gen_random_uuid())
//   prompt_hash: text (not null)
//   response: jsonb (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   expires_at: timestamp with time zone (not null)
// Table: generation_logs
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   resource_type: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   provider_used: text (nullable)
//   metadata: jsonb (nullable)
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
//   custom_outline: text (nullable)
//   use_custom_outline: boolean (nullable, default: false)
// Table: subscription_plans
//   id: text (not null)
//   name: text (not null)
//   price_id: text (nullable)
//   generation_limit: integer (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   features: jsonb (nullable, default: '[]'::jsonb)
// Table: user_settings
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   primary_color: text (not null, default: '#d97706'::text)
//   font_family: text (not null, default: 'Arial'::text)
//   logo_base64: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   language: text (not null, default: 'pt'::text)
// Table: user_subscriptions
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   plan_id: text (not null)
//   status: text (not null)
//   expires_at: timestamp with time zone (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   stripe_subscription_id: text (nullable)
//   sermons_generated: integer (nullable, default: 0)
//   usage_reset_at: timestamp with time zone (nullable)

// --- CONSTRAINTS ---
// Table: api_providers
//   PRIMARY KEY api_providers_pkey: PRIMARY KEY (id)
//   UNIQUE api_providers_provider_name_key: UNIQUE (provider_name)
// Table: bible_books
//   PRIMARY KEY bible_books_pkey: PRIMARY KEY (id)
//   FOREIGN KEY bible_books_version_id_fkey: FOREIGN KEY (version_id) REFERENCES bible_versions(id) ON DELETE CASCADE
// Table: bible_chapters
//   FOREIGN KEY bible_chapters_book_id_fkey: FOREIGN KEY (book_id) REFERENCES bible_books(id) ON DELETE CASCADE
//   PRIMARY KEY bible_chapters_pkey: PRIMARY KEY (id)
// Table: bible_verses
//   FOREIGN KEY bible_verses_chapter_id_fkey: FOREIGN KEY (chapter_id) REFERENCES bible_chapters(id) ON DELETE CASCADE
//   PRIMARY KEY bible_verses_pkey: PRIMARY KEY (id)
// Table: bible_versions
//   UNIQUE bible_versions_abbreviation_key: UNIQUE (abbreviation)
//   UNIQUE bible_versions_name_key: UNIQUE (name)
//   PRIMARY KEY bible_versions_pkey: PRIMARY KEY (id)
// Table: contact_messages
//   PRIMARY KEY contact_messages_pkey: PRIMARY KEY (id)
//   FOREIGN KEY contact_messages_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: devotional_limits
//   PRIMARY KEY devotional_limits_pkey: PRIMARY KEY (id)
//   FOREIGN KEY devotional_limits_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: devotionals
//   PRIMARY KEY devotionals_pkey: PRIMARY KEY (id)
//   FOREIGN KEY devotionals_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: email_logs
//   PRIMARY KEY email_logs_pkey: PRIMARY KEY (id)
// Table: gemini_cache
//   PRIMARY KEY gemini_cache_pkey: PRIMARY KEY (id)
//   UNIQUE gemini_cache_prompt_hash_key: UNIQUE (prompt_hash)
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
//   UNIQUE user_subscriptions_user_id_key: UNIQUE (user_id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: api_providers
//   Policy "Allow admin all access" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
//     WITH CHECK: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
//   Policy "Allow read access for authenticated users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: bible_books
//   Policy "Permitir leitura de livros" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: bible_chapters
//   Policy "Permitir leitura de capítulos" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: bible_verses
//   Policy "Permitir leitura de versículos" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: bible_versions
//   Policy "Permitir leitura de versões" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: contact_messages
//   Policy "Users can insert their own messages" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
// Table: devotional_limits
//   Policy "Users can delete their own devotional limits" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "Users can insert their own devotional limits" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can update their own devotional limits" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can view their own devotional limits" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
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
//   Policy "admin_all_devotionals" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
//     WITH CHECK: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
// Table: email_logs
//   Policy "admin_all_email_logs" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
//     WITH CHECK: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
// Table: gemini_cache
//   Policy "Allow anon read access" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "Allow authenticated insert access" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Allow authenticated read access" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow authenticated update access" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
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
//   Policy "admin_all_sermons" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
//     WITH CHECK: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
// Table: subscription_plans
//   Policy "Allow read access to all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Permitir leitura de planos" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.role() = 'authenticated'::text)
// Table: user_settings
//   Policy "Users can insert their own settings" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can select their own settings" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "Users can update their own settings" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: user_subscriptions
//   Policy "Permitir leitura da própria assinatura" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//   Policy "Users can view their own subscriptions" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "admin_delete_user_subscriptions" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
//   Policy "admin_insert_user_subscriptions" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
//   Policy "admin_select_user_subscriptions" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
//   Policy "admin_update_user_subscriptions" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
//     WITH CHECK: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_api_providers_updated_at()
//   CREATE OR REPLACE FUNCTION public.handle_api_providers_updated_at()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     NEW.updated_at = NOW();
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     -- Insert default free subscription if it doesn't exist
//     IF NOT EXISTS (SELECT 1 FROM public.user_subscriptions WHERE user_id = NEW.id) THEN
//       INSERT INTO public.user_subscriptions (user_id, plan_id, status, expires_at, sermons_generated)
//       VALUES (
//         NEW.id,
//         'free',
//         'active',
//         NOW() + INTERVAL '10 years',
//         0
//       );
//     END IF;
//   
//     -- Insert default user settings
//     INSERT INTO public.user_settings (user_id, primary_color, font_family)
//     VALUES (NEW.id, '#d97706', 'Arial')
//     ON CONFLICT (user_id) DO NOTHING;
//   
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION handle_reset_usage()
//   CREATE OR REPLACE FUNCTION public.handle_reset_usage()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     -- Se o admin atualizou explicitamente o sermons_generated para 0 via Painel Admin, 
//     -- marcamos o momento do reset. Essa data sera usada para ignorar logs anteriores a este momento.
//     IF NEW.sermons_generated = 0 THEN
//       NEW.usage_reset_at = NOW();
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: api_providers
//   set_api_providers_updated_at: CREATE TRIGGER set_api_providers_updated_at BEFORE UPDATE ON public.api_providers FOR EACH ROW EXECUTE FUNCTION handle_api_providers_updated_at()
// Table: user_subscriptions
//   on_reset_usage_before: CREATE TRIGGER on_reset_usage_before BEFORE UPDATE OF sermons_generated ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION handle_reset_usage()

// --- INDEXES ---
// Table: api_providers
//   CREATE UNIQUE INDEX api_providers_provider_name_key ON public.api_providers USING btree (provider_name)
// Table: bible_versions
//   CREATE UNIQUE INDEX bible_versions_abbreviation_key ON public.bible_versions USING btree (abbreviation)
//   CREATE UNIQUE INDEX bible_versions_name_key ON public.bible_versions USING btree (name)
// Table: gemini_cache
//   CREATE UNIQUE INDEX gemini_cache_prompt_hash_key ON public.gemini_cache USING btree (prompt_hash)
// Table: user_settings
//   CREATE UNIQUE INDEX user_settings_user_id_key ON public.user_settings USING btree (user_id)
// Table: user_subscriptions
//   CREATE UNIQUE INDEX user_subscriptions_user_id_key ON public.user_subscriptions USING btree (user_id)

