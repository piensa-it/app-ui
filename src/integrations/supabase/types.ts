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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          points: number
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          points?: number
          requirement_type: string
          requirement_value: number
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          points?: number
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          accion: string
          created_at: string
          detalle: Json | null
          entidad: string
          entidad_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          accion: string
          created_at?: string
          detalle?: Json | null
          entidad: string
          entidad_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          accion?: string
          created_at?: string
          detalle?: Json | null
          entidad?: string
          entidad_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        // P4-3: añadido a mano hasta que el propietario regenere types tras
        // aplicar 20260721160000.
        Row: {
          activo: boolean
          contacto: string | null
          created_at: string
          direccion: string | null
          email: string | null
          etiquetas: string[]
          id: string
          nombre: string
          notas: string | null
          telefono: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          contacto?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          etiquetas?: string[]
          id?: string
          nombre: string
          notas?: string | null
          telefono?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activo?: boolean
          contacto?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          etiquetas?: string[]
          id?: string
          nombre?: string
          notas?: string | null
          telefono?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          activo: boolean
          category_id: string | null
          created_at: string
          id: string
          monto: number
          periodo: string | null
          umbral_alerta: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          category_id?: string | null
          created_at?: string
          id?: string
          monto: number
          periodo?: string | null
          umbral_alerta?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activo?: boolean
          category_id?: string | null
          created_at?: string
          id?: string
          monto?: number
          periodo?: string | null
          umbral_alerta?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string
          es_ambos_tipos: boolean | null
          family_account_id: string | null
          icon: string
          id: string
          nombre: string
          presupuesto: number | null
          tipo: string
          user_id: string | null
        }
        Insert: {
          color: string
          created_at?: string
          es_ambos_tipos?: boolean | null
          family_account_id?: string | null
          icon: string
          id?: string
          nombre: string
          presupuesto?: number | null
          tipo: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          es_ambos_tipos?: boolean | null
          family_account_id?: string | null
          icon?: string
          id?: string
          nombre?: string
          presupuesto?: number | null
          tipo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_family_account_id_fkey"
            columns: ["family_account_id"]
            isOneToOne: false
            referencedRelation: "family_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string | null
          flag_emoji: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          flag_emoji: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          flag_emoji?: string
          name?: string
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          created_at: string | null
          decimal_places: number
          exchange_rate_to_cop: number
          id: string
          locale: string
          name: string
          symbol: string
        }
        Insert: {
          code: string
          created_at?: string | null
          decimal_places?: number
          exchange_rate_to_cop?: number
          id?: string
          locale?: string
          name: string
          symbol: string
        }
        Update: {
          code?: string
          created_at?: string | null
          decimal_places?: number
          exchange_rate_to_cop?: number
          id?: string
          locale?: string
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      email_staging: {
        Row: {
          body_html: string | null
          body_text: string | null
          confidence: number | null
          created_at: string | null
          dedup_hash: string | null
          external_message_id: string | null
          extraction: Json | null
          id: string
          processed: boolean | null
          processed_at: string | null
          processing_error: string | null
          provider: string
          raw_data: Json | null
          received_at: string | null
          sender_email: string
          status: string
          subject: string | null
          transaction_id: string | null
          transaction_reference: string | null
          user_id: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          confidence?: number | null
          created_at?: string | null
          dedup_hash?: string | null
          external_message_id?: string | null
          extraction?: Json | null
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          processing_error?: string | null
          provider?: string
          raw_data?: Json | null
          received_at?: string | null
          sender_email: string
          status?: string
          subject?: string | null
          transaction_id?: string | null
          transaction_reference?: string | null
          user_id?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          confidence?: number | null
          created_at?: string | null
          dedup_hash?: string | null
          external_message_id?: string | null
          extraction?: Json | null
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          processing_error?: string | null
          provider?: string
          raw_data?: Json | null
          received_at?: string | null
          sender_email?: string
          status?: string
          subject?: string | null
          transaction_id?: string | null
          transaction_reference?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_staging_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_staging_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_verification_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          verified?: boolean
        }
        Relationships: []
      }
      family_accounts: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_accounts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          family_account_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          family_account_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          family_account_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_account_id_fkey"
            columns: ["family_account_id"]
            isOneToOne: false
            referencedRelation: "family_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempt_time: string
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          attempt_time?: string
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Update: {
          attempt_time?: string
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          token: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          activo: boolean
          color: string
          created_at: string
          cupo_total: number | null
          entidad: string | null
          fecha_corte: number | null
          fecha_pago: number | null
          icono: string
          id: string
          moneda: string
          nombre: string
          saldo_actual: number | null
          saldo_inicial: number
          tipo: string
          ultimos_4: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activo?: boolean
          color?: string
          created_at?: string
          cupo_total?: number | null
          entidad?: string | null
          fecha_corte?: number | null
          fecha_pago?: number | null
          icono?: string
          id?: string
          moneda?: string
          nombre: string
          saldo_actual?: number | null
          saldo_inicial?: number
          tipo: string
          ultimos_4?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activo?: boolean
          color?: string
          created_at?: string
          cupo_total?: number | null
          entidad?: string | null
          fecha_corte?: number | null
          fecha_pago?: number | null
          icono?: string
          id?: string
          moneda?: string
          nombre?: string
          saldo_actual?: number | null
          saldo_inicial?: number
          tipo?: string
          ultimos_4?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reminders: {
        Row: {
          activo: boolean | null
          category_id: string | null
          created_at: string
          descripcion: string | null
          family_account_id: string | null
          fecha_vencimiento: string
          frecuencia: string
          id: string
          moneda: string
          monto: number | null
          tipo: string
          titulo: string
          ultima_notificacion: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activo?: boolean | null
          category_id?: string | null
          created_at?: string
          descripcion?: string | null
          family_account_id?: string | null
          fecha_vencimiento: string
          frecuencia: string
          id?: string
          moneda?: string
          monto?: number | null
          tipo: string
          titulo: string
          ultima_notificacion?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activo?: boolean | null
          category_id?: string | null
          created_at?: string
          descripcion?: string | null
          family_account_id?: string | null
          fecha_vencimiento?: string
          frecuencia?: string
          id?: string
          moneda?: string
          monto?: number | null
          tipo?: string
          titulo?: string
          ultima_notificacion?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reminders_family_account_id_fkey"
            columns: ["family_account_id"]
            isOneToOne: false
            referencedRelation: "family_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          celular: string | null
          ciudad: string | null
          created_at: string
          fecha_nacimiento: string | null
          id: string
          name: string | null
          onboarding_completed: boolean | null
          pais: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          celular?: string | null
          ciudad?: string | null
          created_at?: string
          fecha_nacimiento?: string | null
          id: string
          name?: string | null
          onboarding_completed?: boolean | null
          pais?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          celular?: string | null
          ciudad?: string | null
          created_at?: string
          fecha_nacimiento?: string | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          pais?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_country"
            columns: ["pais"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      recurring_transactions: {
        Row: {
          activo: boolean
          category_id: string | null
          created_at: string
          fecha_fin: string | null
          fecha_inicio: string
          frecuencia: string
          id: string
          moneda: string
          nombre: string
          payment_method_id: string | null
          subcategory_id: string | null
          tipo: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          activo?: boolean
          category_id?: string | null
          created_at?: string
          fecha_fin?: string | null
          fecha_inicio: string
          frecuencia: string
          id?: string
          moneda?: string
          nombre: string
          payment_method_id?: string | null
          subcategory_id?: string | null
          tipo: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          activo?: boolean
          category_id?: string | null
          created_at?: string
          fecha_fin?: string | null
          fecha_inicio?: string
          frecuencia?: string
          id?: string
          moneda?: string
          nombre?: string
          payment_method_id?: string | null
          subcategory_id?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          nombre: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          nombre: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          archivo_nombre: string | null
          archivo_url: string | null
          category_id: string | null
          created_at: string
          descripcion: string | null
          establecimiento: string | null
          family_account_id: string | null
          fecha: string
          id: string
          medio_pago: string
          moneda: string
          payment_method_id: string | null
          recurring_period: string | null
          recurring_transaction_id: string | null
          source: string
          subcategory_id: string | null
          tipo: string
          transfer_direction: string | null
          transfer_group_id: string | null
          user_id: string | null
          valor: number
        }
        Insert: {
          archivo_nombre?: string | null
          archivo_url?: string | null
          category_id?: string | null
          created_at?: string
          descripcion?: string | null
          establecimiento?: string | null
          family_account_id?: string | null
          fecha?: string
          id?: string
          medio_pago: string
          moneda?: string
          payment_method_id?: string | null
          recurring_period?: string | null
          recurring_transaction_id?: string | null
          source?: string
          subcategory_id?: string | null
          tipo: string
          transfer_direction?: string | null
          transfer_group_id?: string | null
          user_id?: string | null
          valor: number
        }
        Update: {
          archivo_nombre?: string | null
          archivo_url?: string | null
          category_id?: string | null
          created_at?: string
          descripcion?: string | null
          establecimiento?: string | null
          family_account_id?: string | null
          fecha?: string
          id?: string
          medio_pago?: string
          moneda?: string
          payment_method_id?: string | null
          recurring_period?: string | null
          recurring_transaction_id?: string | null
          source?: string
          subcategory_id?: string | null
          tipo?: string
          transfer_direction?: string | null
          transfer_group_id?: string | null
          user_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_family_account_id_fkey"
            columns: ["family_account_id"]
            isOneToOne: false
            referencedRelation: "family_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_recurring_transaction_id_fkey"
            columns: ["recurring_transaction_id"]
            isOneToOne: false
            referencedRelation: "recurring_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_config: {
        Row: {
          color_theme: string | null
          formato_cifras: string
          idioma: string
          meta_mensual: number
          modo_oscuro: boolean
          moneda: string
          tema_modo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color_theme?: string | null
          formato_cifras?: string
          idioma?: string
          meta_mensual?: number
          modo_oscuro?: boolean
          moneda?: string
          tema_modo?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color_theme?: string | null
          formato_cifras?: string
          idioma?: string
          meta_mensual?: number
          modo_oscuro?: boolean
          moneda?: string
          tema_modo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_config_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          is_primary: boolean
          updated_at: string
          user_id: string
          verification_token: string | null
          verified: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_primary?: boolean
          updated_at?: string
          user_id: string
          verification_token?: string | null
          verified?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_primary?: boolean
          updated_at?: string
          user_id?: string
          verification_token?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          level: string | null
          longest_streak: number | null
          score: number | null
          total_transactions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          level?: string | null
          longest_streak?: number | null
          score?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          level?: string | null
          longest_streak?: number | null
          score?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gamification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      account_balances: {
        Row: {
          activo: boolean | null
          cupo_disponible: number | null
          cupo_total: number | null
          entidad: string | null
          fecha_corte: number | null
          fecha_pago: number | null
          id: string | null
          moneda: string | null
          naturaleza: string | null
          nombre: string | null
          saldo_calculado: number | null
          saldo_inicial: number | null
          tipo: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_user_level: { Args: { p_score: number }; Returns: string }
      calculate_user_streak: { Args: { p_user_id: string }; Returns: undefined }
      cleanup_old_login_attempts: { Args: never; Returns: undefined }
      create_default_categories_for_user: {
        Args: { _user_id: string }
        Returns: undefined
      }
      create_transfer: {
        Args: {
          p_descripcion?: string
          p_fecha?: string
          p_from: string
          p_to: string
          p_valor: number
        }
        Returns: string
      }
      create_welcome_notifications_for_user: {
        Args: { _user_id: string }
        Returns: undefined
      }
      email_queue_archive: { Args: { msg_id: number }; Returns: boolean }
      email_queue_delete: { Args: { msg_id: number }; Returns: boolean }
      email_queue_read: {
        Args: { qty: number; vt: number }
        Returns: unknown[]
        SetofOptions: {
          from: "*"
          to: "message_record"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      email_queue_send: { Args: { payload: Json }; Returns: number }
      // P1-9b: serie mensual de gasto por categoría (dashboard). Añadido a mano
      // hasta regenerar types tras aplicar 20260721190000.
      get_monthly_category_spending: {
        Args: Record<string, never>
        Returns: {
          mes: string
          category_id: string | null
          total: number
        }[]
      }
      // P1-9 (cont.): gasto por categoría en servidor (Reportes). Añadido a
      // mano hasta regenerar types tras aplicar 20260721170000.
      get_category_spending: {
        Args: {
          p_date_from?: string
          p_date_to?: string
        }
        Returns: {
          category_id: string | null
          total: number
        }[]
      }
      // P1-9: agregados de transacciones en servidor. Añadido a mano hasta que
      // el propietario regenere types tras aplicar 20260721150000.
      get_transactions_summary: {
        Args: {
          p_tipos?: string[]
          p_category_id?: string
          p_medios?: string[]
          p_date_from?: string
          p_date_to?: string
          p_search?: string
        }
        Returns: {
          moneda: string
          tipo: string
          total: number
          cnt: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_family_member: {
        Args: { _family_account_id: string; _user_id: string }
        Returns: boolean
      }
      is_family_owner: {
        Args: { _family_account_id: string; _user_id: string }
        Returns: boolean
      }
      migrate_existing_user_emails: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "super_admin" | "user"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["super_admin", "user"],
    },
  },
} as const
