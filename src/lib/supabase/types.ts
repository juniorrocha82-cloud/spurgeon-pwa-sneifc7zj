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
            foreignKeyName: 'bible_books_version_id_fkey'
            columns: ['version_id']
            isOneToOne: false
            referencedRelation: 'bible_versions'
            referencedColumns: ['id']
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
            foreignKeyName: 'bible_chapters_book_id_fkey'
            columns: ['book_id']
            isOneToOne: false
            referencedRelation: 'bible_books'
            referencedColumns: ['id']
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
            foreignKeyName: 'bible_verses_chapter_id_fkey'
            columns: ['chapter_id']
            isOneToOne: false
            referencedRelation: 'bible_chapters'
            referencedColumns: ['id']
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
          user_id?: string
        }
        Relationships: []
      }
      youtube_playlists: {
        Row: {
          channel_name: string
          channel_url: string
          created_at: string | null
          description: string | null
          id: string
          playlist_id: string
          playlist_name: string
          thumbnail_url: string | null
          updated_at: string | null
          video_count: number | null
        }
        Insert: {
          channel_name: string
          channel_url: string
          created_at?: string | null
          description?: string | null
          id?: string
          playlist_id: string
          playlist_name: string
          thumbnail_url?: string | null
          updated_at?: string | null
          video_count?: number | null
        }
        Update: {
          channel_name?: string
          channel_url?: string
          created_at?: string | null
          description?: string | null
          id?: string
          playlist_id?: string
          playlist_name?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          video_count?: number | null
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
// Table: youtube_playlists
//   id: uuid (not null, default: gen_random_uuid())
//   channel_name: text (not null)
//   channel_url: text (not null)
//   playlist_id: text (not null)
//   playlist_name: text (not null)
//   description: text (nullable)
//   thumbnail_url: text (nullable)
//   video_count: integer (nullable, default: 0)
//   created_at: timestamp without time zone (nullable, default: now())
//   updated_at: timestamp without time zone (nullable, default: now())

// --- CONSTRAINTS ---
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
// Table: youtube_playlists
//   PRIMARY KEY youtube_playlists_pkey: PRIMARY KEY (id)
//   UNIQUE youtube_playlists_playlist_id_key: UNIQUE (playlist_id)

// --- ROW LEVEL SECURITY POLICIES ---
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
//   Policy "admin_insert_user_subscriptions" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
//   Policy "admin_update_user_subscriptions" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
//     WITH CHECK: (auth.uid() = '911d1666-978b-4ead-9be2-5a49028c767f'::uuid)
// Table: youtube_playlists
//   Policy "Allow public read access on youtube_playlists" (SELECT, PERMISSIVE) roles={public}
//     USING: true

// --- DATABASE FUNCTIONS ---
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

// --- INDEXES ---
// Table: bible_versions
//   CREATE UNIQUE INDEX bible_versions_abbreviation_key ON public.bible_versions USING btree (abbreviation)
//   CREATE UNIQUE INDEX bible_versions_name_key ON public.bible_versions USING btree (name)
// Table: user_settings
//   CREATE UNIQUE INDEX user_settings_user_id_key ON public.user_settings USING btree (user_id)
// Table: youtube_playlists
//   CREATE UNIQUE INDEX youtube_playlists_playlist_id_key ON public.youtube_playlists USING btree (playlist_id)
