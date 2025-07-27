export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      access_levels: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      accounts_payable: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          description: string
          due_date: string
          id: string
          notes: string | null
          payment_date: string | null
          status: string
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          description: string
          due_date: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_payable_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_payable_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts_receivable: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          customer_id: string | null
          description: string
          due_date: string
          id: string
          notes: string | null
          payment_date: string | null
          sale_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          customer_id?: string | null
          description: string
          due_date: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          sale_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          customer_id?: string | null
          description?: string
          due_date?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          sale_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          title: string
          type: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title: string
          type: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          company_id: string
          created_at: string
          device_type: string | null
          duration_ms: number | null
          event_name: string
          id: string
          meta: Json | null
          route: string | null
          user_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          device_type?: string | null
          duration_ms?: number | null
          event_name: string
          id?: string
          meta?: Json | null
          route?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          device_type?: string | null
          duration_ms?: number | null
          event_name?: string
          id?: string
          meta?: Json | null
          route?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_snapshots: {
        Row: {
          company_id: string
          created_at: string
          id: string
          metrics: Json
          period_type: string
          snapshot_date: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          metrics?: Json
          period_type?: string
          snapshot_date: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          metrics?: Json
          period_type?: string
          snapshot_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_versions: {
        Row: {
          created_at: string
          deployed_at: string
          deployed_by: string | null
          environment: string
          git_branch: string
          git_sha: string
          id: string
          metadata: Json | null
          release_notes: string | null
          status: string
          updated_at: string
          version_number: string
        }
        Insert: {
          created_at?: string
          deployed_at?: string
          deployed_by?: string | null
          environment: string
          git_branch: string
          git_sha: string
          id?: string
          metadata?: Json | null
          release_notes?: string | null
          status?: string
          updated_at?: string
          version_number: string
        }
        Update: {
          created_at?: string
          deployed_at?: string
          deployed_by?: string | null
          environment?: string
          git_branch?: string
          git_sha?: string
          id?: string
          metadata?: Json | null
          release_notes?: string | null
          status?: string
          updated_at?: string
          version_number?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          company_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          severity: string
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          company_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          severity?: string
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          severity?: string
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auditoria_config: {
        Row: {
          auditoria_ativa: boolean
          auto_limpeza_segura: boolean
          company_id: string
          created_at: string
          email_notificacao: string | null
          escopo_padrao: Json
          frequencia_cron: string
          id: string
          limite_problemas_alerta: number
          manter_historico_dias: number
          notificacoes_ativas: boolean
          proxima_execucao: string | null
          regras_preservacao: Json
          ultima_execucao: string | null
          updated_at: string
          webhook_notificacao: string | null
        }
        Insert: {
          auditoria_ativa?: boolean
          auto_limpeza_segura?: boolean
          company_id: string
          created_at?: string
          email_notificacao?: string | null
          escopo_padrao?: Json
          frequencia_cron?: string
          id?: string
          limite_problemas_alerta?: number
          manter_historico_dias?: number
          notificacoes_ativas?: boolean
          proxima_execucao?: string | null
          regras_preservacao?: Json
          ultima_execucao?: string | null
          updated_at?: string
          webhook_notificacao?: string | null
        }
        Update: {
          auditoria_ativa?: boolean
          auto_limpeza_segura?: boolean
          company_id?: string
          created_at?: string
          email_notificacao?: string | null
          escopo_padrao?: Json
          frequencia_cron?: string
          id?: string
          limite_problemas_alerta?: number
          manter_historico_dias?: number
          notificacoes_ativas?: boolean
          proxima_execucao?: string | null
          regras_preservacao?: Json
          ultima_execucao?: string | null
          updated_at?: string
          webhook_notificacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      auditoria_historico: {
        Row: {
          arquivos_analisados: number
          arquivos_duplicados: Json
          arquivos_nao_utilizados: Json
          company_id: string
          componentes_duplicados: Json
          created_at: string
          erro_detalhes: string | null
          escopo_auditoria: Json
          feedback_usuario: string | null
          hooks_nao_utilizados: Json
          id: string
          melhorias_aplicadas: Json
          padroes_aprendidos: Json
          problemas_encontrados: number
          score_aprendizado: number
          status: string
          sugestoes_limpeza: Json
          tempo_execucao_ms: number
          tipo_auditoria: string
          updated_at: string
          user_id: string
        }
        Insert: {
          arquivos_analisados?: number
          arquivos_duplicados?: Json
          arquivos_nao_utilizados?: Json
          company_id: string
          componentes_duplicados?: Json
          created_at?: string
          erro_detalhes?: string | null
          escopo_auditoria?: Json
          feedback_usuario?: string | null
          hooks_nao_utilizados?: Json
          id?: string
          melhorias_aplicadas?: Json
          padroes_aprendidos?: Json
          problemas_encontrados?: number
          score_aprendizado?: number
          status?: string
          sugestoes_limpeza?: Json
          tempo_execucao_ms?: number
          tipo_auditoria: string
          updated_at?: string
          user_id: string
        }
        Update: {
          arquivos_analisados?: number
          arquivos_duplicados?: Json
          arquivos_nao_utilizados?: Json
          company_id?: string
          componentes_duplicados?: Json
          created_at?: string
          erro_detalhes?: string | null
          escopo_auditoria?: Json
          feedback_usuario?: string | null
          hooks_nao_utilizados?: Json
          id?: string
          melhorias_aplicadas?: Json
          padroes_aprendidos?: Json
          problemas_encontrados?: number
          score_aprendizado?: number
          status?: string
          sugestoes_limpeza?: Json
          tempo_execucao_ms?: number
          tipo_auditoria?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_historico_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_settings: {
        Row: {
          auto_backup_enabled: boolean
          backup_frequency: string
          backup_tables: string[]
          backup_time: string
          company_id: string
          created_at: string
          id: string
          last_backup_at: string | null
          next_backup_at: string | null
          retention_days: number
          updated_at: string
        }
        Insert: {
          auto_backup_enabled?: boolean
          backup_frequency?: string
          backup_tables?: string[]
          backup_time?: string
          company_id: string
          created_at?: string
          id?: string
          last_backup_at?: string | null
          next_backup_at?: string | null
          retention_days?: number
          updated_at?: string
        }
        Update: {
          auto_backup_enabled?: boolean
          backup_frequency?: string
          backup_tables?: string[]
          backup_time?: string
          company_id?: string
          created_at?: string
          id?: string
          last_backup_at?: string | null
          next_backup_at?: string | null
          retention_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_number: string
          account_type: string
          agency: string | null
          bank_name: string
          company_id: string
          created_at: string
          current_balance: number
          id: string
          initial_balance: number
          is_active: boolean
          updated_at: string
        }
        Insert: {
          account_number: string
          account_type?: string
          agency?: string | null
          bank_name: string
          company_id: string
          created_at?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          account_number?: string
          account_type?: string
          agency?: string | null
          bank_name?: string
          company_id?: string
          created_at?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      billing_logs: {
        Row: {
          amount: number | null
          company_id: string
          created_at: string | null
          currency: string | null
          error_message: string | null
          event_type: string
          id: string
          invoice_url: string | null
          metadata: Json | null
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string | null
        }
        Insert: {
          amount?: number | null
          company_id: string
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          invoice_url?: string | null
          metadata?: Json | null
          status: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount?: number | null
          company_id?: string
          created_at?: string | null
          currency?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          invoice_url?: string | null
          metadata?: Json | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_logs_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "company_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_plans: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          interval: string
          max_users: number | null
          name: string
          price: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string
          max_users?: number | null
          name: string
          price: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string
          max_users?: number | null
          name?: string
          price?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      checkout_stripe: {
        Row: {
          attrs: Json | null
          customer: string | null
          id: string | null
          payment_intent: string | null
          subscription: string | null
        }
        Insert: {
          attrs?: Json | null
          customer?: string | null
          id?: string | null
          payment_intent?: string | null
          subscription?: string | null
        }
        Update: {
          attrs?: Json | null
          customer?: string | null
          id?: string | null
          payment_intent?: string | null
          subscription?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          document: string
          email: string | null
          fiscal_email: string | null
          id: string
          legal_name: string | null
          legal_representative: string | null
          municipal_registration: string | null
          name: string
          phone: string | null
          state_registration: string | null
          tax_regime: string | null
          trade_name: string | null
          updated_at: string
          zipcode: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          document: string
          email?: string | null
          fiscal_email?: string | null
          id?: string
          legal_name?: string | null
          legal_representative?: string | null
          municipal_registration?: string | null
          name: string
          phone?: string | null
          state_registration?: string | null
          tax_regime?: string | null
          trade_name?: string | null
          updated_at?: string
          zipcode?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          document?: string
          email?: string | null
          fiscal_email?: string | null
          id?: string
          legal_name?: string | null
          legal_representative?: string | null
          municipal_registration?: string | null
          name?: string
          phone?: string | null
          state_registration?: string | null
          tax_regime?: string | null
          trade_name?: string | null
          updated_at?: string
          zipcode?: string | null
        }
        Relationships: []
      }
      company_integrations: {
        Row: {
          company_id: string
          config: Json | null
          created_at: string | null
          credentials: Json | null
          id: string
          integration_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          config?: Json | null
          created_at?: string | null
          credentials?: Json | null
          id?: string
          integration_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          config?: Json | null
          created_at?: string | null
          credentials?: Json | null
          id?: string
          integration_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_integrations_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations_available"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          cdn_cache_settings: Json | null
          cdn_custom_domain: string | null
          cdn_enabled: boolean | null
          cdn_mode: string | null
          cdn_url_base: string | null
          certificate_cn: string | null
          certificate_data: string | null
          certificate_expires_at: string | null
          certificate_file: string | null
          certificate_fingerprint: string | null
          certificate_iv: string | null
          certificate_last_used_at: string | null
          certificate_metadata: Json | null
          certificate_password: string | null
          certificate_password_encrypted: string | null
          certificate_password_iv: string | null
          certificate_uploaded_at: string | null
          company_id: string
          created_at: string | null
          id: string
          nfe_api_token: string | null
          nfe_environment: string | null
          stripe_products: Json | null
          stripe_publishable_key: string | null
          stripe_secret_key: string | null
          stripe_webhook_secret: string | null
          updated_at: string | null
        }
        Insert: {
          cdn_cache_settings?: Json | null
          cdn_custom_domain?: string | null
          cdn_enabled?: boolean | null
          cdn_mode?: string | null
          cdn_url_base?: string | null
          certificate_cn?: string | null
          certificate_data?: string | null
          certificate_expires_at?: string | null
          certificate_file?: string | null
          certificate_fingerprint?: string | null
          certificate_iv?: string | null
          certificate_last_used_at?: string | null
          certificate_metadata?: Json | null
          certificate_password?: string | null
          certificate_password_encrypted?: string | null
          certificate_password_iv?: string | null
          certificate_uploaded_at?: string | null
          company_id: string
          created_at?: string | null
          id?: string
          nfe_api_token?: string | null
          nfe_environment?: string | null
          stripe_products?: Json | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          stripe_webhook_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          cdn_cache_settings?: Json | null
          cdn_custom_domain?: string | null
          cdn_enabled?: boolean | null
          cdn_mode?: string | null
          cdn_url_base?: string | null
          certificate_cn?: string | null
          certificate_data?: string | null
          certificate_expires_at?: string | null
          certificate_file?: string | null
          certificate_fingerprint?: string | null
          certificate_iv?: string | null
          certificate_last_used_at?: string | null
          certificate_metadata?: Json | null
          certificate_password?: string | null
          certificate_password_encrypted?: string | null
          certificate_password_iv?: string | null
          certificate_uploaded_at?: string | null
          company_id?: string
          created_at?: string | null
          id?: string
          nfe_api_token?: string | null
          nfe_environment?: string | null
          stripe_products?: Json | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          stripe_webhook_secret?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_subscriptions: {
        Row: {
          billing_plan_id: string | null
          canceled_at: string | null
          company_id: string
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          billing_plan_id?: string | null
          canceled_at?: string | null
          company_id: string
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_plan_id?: string | null
          canceled_at?: string | null
          company_id?: string
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_subscriptions_billing_plan_id_fkey"
            columns: ["billing_plan_id"]
            isOneToOne: false
            referencedRelation: "billing_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          company_id: string
          contract_number: string
          contract_type: string
          contract_value: number | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          document_url: string | null
          end_date: string
          id: string
          observations: string | null
          signature_date: string | null
          start_date: string
          status: string
          supplier_id: string | null
          termination_clause: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          contract_number: string
          contract_type: string
          contract_value?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          document_url?: string | null
          end_date: string
          id?: string
          observations?: string | null
          signature_date?: string | null
          start_date: string
          status?: string
          supplier_id?: string | null
          termination_clause?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          contract_number?: string
          contract_type?: string
          contract_value?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          document_url?: string | null
          end_date?: string
          id?: string
          observations?: string | null
          signature_date?: string | null
          start_date?: string
          status?: string
          supplier_id?: string | null
          termination_clause?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      copilot_engineer_notes: {
        Row: {
          created_at: string | null
          id: string
          notes: string
          tag: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes: string
          tag?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string
          tag?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cost_centers: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_stripe: {
        Row: {
          attrs: Json | null
          created: string | null
          description: string | null
          email: string | null
          id: string | null
          name: string | null
        }
        Insert: {
          attrs?: Json | null
          created?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
        }
        Update: {
          attrs?: Json | null
          created?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          company_id: string
          created_at: string
          customer_type: string
          document: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          zipcode: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id: string
          created_at?: string
          customer_type?: string
          document?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zipcode?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string
          created_at?: string
          customer_type?: string
          document?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zipcode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          logs: string | null
          metadata: Json | null
          started_at: string
          status: string
          step_name: string
          version_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          logs?: string | null
          metadata?: Json | null
          started_at?: string
          status: string
          step_name: string
          version_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          logs?: string | null
          metadata?: Json | null
          started_at?: string
          status?: string
          step_name?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployment_logs_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "app_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      environment_configs: {
        Row: {
          config: Json
          created_at: string
          environment: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          environment: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          environment?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      finance_settings: {
        Row: {
          alert_days_before: number
          allow_retroactive: boolean
          auto_categorize: boolean
          company_id: string
          created_at: string
          default_currency: string
          id: string
          send_due_alerts: boolean
          settings: Json
          updated_at: string
        }
        Insert: {
          alert_days_before?: number
          allow_retroactive?: boolean
          auto_categorize?: boolean
          company_id: string
          created_at?: string
          default_currency?: string
          id?: string
          send_due_alerts?: boolean
          settings?: Json
          updated_at?: string
        }
        Update: {
          alert_days_before?: number
          allow_retroactive?: boolean
          auto_categorize?: boolean
          company_id?: string
          created_at?: string
          default_currency?: string
          id?: string
          send_due_alerts?: boolean
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      financial_categories: {
        Row: {
          color: string | null
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          attachment_url: string | null
          bank_account_id: string | null
          category_id: string | null
          company_id: string
          cost_center_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string
          due_date: string | null
          id: string
          is_reconciled: boolean
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          reference_id: string | null
          reference_type: string | null
          status: string
          supplier_id: string | null
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          attachment_url?: string | null
          bank_account_id?: string | null
          category_id?: string | null
          company_id: string
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description: string
          due_date?: string | null
          id?: string
          is_reconciled?: boolean
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          supplier_id?: string | null
          transaction_date: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          bank_account_id?: string | null
          category_id?: string | null
          company_id?: string
          cost_center_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string
          due_date?: string | null
          id?: string
          is_reconciled?: boolean
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          supplier_id?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations_available: {
        Row: {
          config_schema: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          company_id: string
          created_at: string
          customer_id: string | null
          id: string
          invoice_number: string
          invoice_type: string
          issue_date: string
          sale_id: string | null
          status: string
          tax_amount: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_number: string
          invoice_type: string
          issue_date?: string
          sale_id?: string | null
          status?: string
          tax_amount?: number | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_number?: string
          invoice_type?: string
          issue_date?: string
          sale_id?: string | null
          status?: string
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices_stripe: {
        Row: {
          attrs: Json | null
          currency: string | null
          customer: string | null
          id: string | null
          period_end: string | null
          period_start: string | null
          status: string | null
          subscription: string | null
          total: number | null
        }
        Insert: {
          attrs?: Json | null
          currency?: string | null
          customer?: string | null
          id?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          subscription?: string | null
          total?: number | null
        }
        Update: {
          attrs?: Json | null
          currency?: string | null
          customer?: string | null
          id?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          subscription?: string | null
          total?: number | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          category: string
          code_snippet: string | null
          content: string
          created_at: string | null
          description: string | null
          effectiveness_score: number | null
          files_affected: string[] | null
          id: string
          last_used: string | null
          solution_type: string | null
          success_rate: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category: string
          code_snippet?: string | null
          content: string
          created_at?: string | null
          description?: string | null
          effectiveness_score?: number | null
          files_affected?: string[] | null
          id?: string
          last_used?: string | null
          solution_type?: string | null
          success_rate?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          code_snippet?: string | null
          content?: string
          created_at?: string | null
          description?: string | null
          effectiveness_score?: number | null
          files_affected?: string[] | null
          id?: string
          last_used?: string | null
          solution_type?: string | null
          success_rate?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      learning_sessions: {
        Row: {
          analysis: Json | null
          build_result: Json | null
          company_id: string
          context: Json | null
          created_at: string | null
          feedback_comment: string | null
          feedback_score: number | null
          id: string
          implementation: Json | null
          improvements_made: string[] | null
          prompt: string | null
          query: string
          response: string
          session_id: string
          tags: string[] | null
          updated_at: string | null
          user_feedback: string | null
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          build_result?: Json | null
          company_id: string
          context?: Json | null
          created_at?: string | null
          feedback_comment?: string | null
          feedback_score?: number | null
          id?: string
          implementation?: Json | null
          improvements_made?: string[] | null
          prompt?: string | null
          query: string
          response: string
          session_id: string
          tags?: string[] | null
          updated_at?: string | null
          user_feedback?: string | null
          user_id: string
        }
        Update: {
          analysis?: Json | null
          build_result?: Json | null
          company_id?: string
          context?: Json | null
          created_at?: string | null
          feedback_comment?: string | null
          feedback_score?: number | null
          id?: string
          implementation?: Json | null
          improvements_made?: string[] | null
          prompt?: string | null
          query?: string
          response?: string
          session_id?: string
          tags?: string[] | null
          updated_at?: string | null
          user_feedback?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lgpd_requests: {
        Row: {
          company_id: string
          created_at: string
          expiry_date: string | null
          export_url: string | null
          id: string
          metadata: Json | null
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          request_type: string
          requested_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          expiry_date?: string | null
          export_url?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type: string
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          expiry_date?: string | null
          export_url?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_type?: string
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_channels: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          status: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          status?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          status?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_integrations: {
        Row: {
          company_id: string
          created_at: string
          credentials: Json
          error_message: string | null
          id: string
          last_sync: string | null
          marketplace: string
          status: string
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          credentials?: Json
          error_message?: string | null
          id?: string
          last_sync?: string | null
          marketplace: string
          status?: string
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          credentials?: Json
          error_message?: string | null
          id?: string
          last_sync?: string | null
          marketplace?: string
          status?: string
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      nfe_items: {
        Row: {
          cofins_base: number | null
          cofins_percentage: number | null
          cofins_value: number | null
          created_at: string
          icms_base: number | null
          icms_percentage: number | null
          icms_value: number | null
          id: string
          invoice_id: string
          ipi_base: number | null
          ipi_percentage: number | null
          ipi_value: number | null
          item_code: string
          item_description: string
          ncm_code: string | null
          pis_base: number | null
          pis_percentage: number | null
          pis_value: number | null
          product_id: string | null
          quantity: number
          total_value: number
          unit_value: number
        }
        Insert: {
          cofins_base?: number | null
          cofins_percentage?: number | null
          cofins_value?: number | null
          created_at?: string
          icms_base?: number | null
          icms_percentage?: number | null
          icms_value?: number | null
          id?: string
          invoice_id: string
          ipi_base?: number | null
          ipi_percentage?: number | null
          ipi_value?: number | null
          item_code: string
          item_description: string
          ncm_code?: string | null
          pis_base?: number | null
          pis_percentage?: number | null
          pis_value?: number | null
          product_id?: string | null
          quantity: number
          total_value: number
          unit_value: number
        }
        Update: {
          cofins_base?: number | null
          cofins_percentage?: number | null
          cofins_value?: number | null
          created_at?: string
          icms_base?: number | null
          icms_percentage?: number | null
          icms_value?: number | null
          id?: string
          invoice_id?: string
          ipi_base?: number | null
          ipi_percentage?: number | null
          ipi_value?: number | null
          item_code?: string
          item_description?: string
          ncm_code?: string | null
          pis_base?: number | null
          pis_percentage?: number | null
          pis_value?: number | null
          product_id?: string | null
          quantity?: number
          total_value?: number
          unit_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "nfe_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nfe_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      nfe_xmls: {
        Row: {
          access_key: string | null
          company_id: string
          created_at: string
          id: string
          invoice_id: string | null
          pdf_url: string | null
          protocol_number: string | null
          qr_code: string | null
          rejection_reason: string | null
          status: string
          updated_at: string
          xml_content: string
          xml_signature: string | null
        }
        Insert: {
          access_key?: string | null
          company_id: string
          created_at?: string
          id?: string
          invoice_id?: string | null
          pdf_url?: string | null
          protocol_number?: string | null
          qr_code?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          xml_content: string
          xml_signature?: string | null
        }
        Update: {
          access_key?: string | null
          company_id?: string
          created_at?: string
          id?: string
          invoice_id?: string | null
          pdf_url?: string | null
          protocol_number?: string | null
          qr_code?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
          xml_content?: string
          xml_signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nfe_xmls_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          company_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          company_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          company_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          features: Json | null
          id: string
          name: string
          price: number
          trial_days: number | null
          updated_at: string
          user_limit: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          name: string
          price: number
          trial_days?: number | null
          updated_at?: string
          user_limit?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          name?: string
          price?: number
          trial_days?: number | null
          updated_at?: string
          user_limit?: number | null
        }
        Relationships: []
      }
      pos_sales: {
        Row: {
          company_id: string
          created_at: string
          customer_id: string | null
          discount: number | null
          id: string
          items: Json
          nfce_issued: boolean | null
          nfce_key: string | null
          notes: string | null
          operator_id: string | null
          payments: Json
          sale_number: string
          status: string
          tax_amount: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          customer_id?: string | null
          discount?: number | null
          id?: string
          items?: Json
          nfce_issued?: boolean | null
          nfce_key?: string | null
          notes?: string | null
          operator_id?: string | null
          payments?: Json
          sale_number: string
          status?: string
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          customer_id?: string | null
          discount?: number | null
          id?: string
          items?: Json
          nfce_issued?: boolean | null
          nfce_key?: string | null
          notes?: string | null
          operator_id?: string | null
          payments?: Json
          sale_number?: string
          status?: string
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      privacy_consents: {
        Row: {
          accepted: boolean
          accepted_at: string | null
          company_id: string
          consent_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          revoked_at: string | null
          terms_url: string | null
          updated_at: string
          user_agent: string | null
          user_id: string
          version: string
        }
        Insert: {
          accepted?: boolean
          accepted_at?: string | null
          company_id: string
          consent_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          revoked_at?: string | null
          terms_url?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
          version?: string
        }
        Update: {
          accepted?: boolean
          accepted_at?: string | null
          company_id?: string
          consent_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          revoked_at?: string | null
          terms_url?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      privacy_terms: {
        Row: {
          company_id: string | null
          content: string
          created_at: string
          created_by: string | null
          effective_date: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          company_id?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          version: string
        }
        Update: {
          company_id?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      production_orders: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          notes: string | null
          order_number: string
          product_id: string
          quantity: number
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          order_number: string
          product_id: string
          quantity: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          product_id?: string
          quantity?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          brand: string | null
          category_id: string | null
          cest_code: string | null
          code: string
          cofins_fixed: number | null
          company_id: string
          condition: string | null
          cost_price: number | null
          created_at: string
          crossdocking_days: number | null
          depth: number | null
          description: string | null
          dimensions: string | null
          estimated_tax_percentage: number | null
          expiry_date: string | null
          external_link: string | null
          format: string | null
          free_shipping: boolean | null
          gross_weight: number | null
          height: number | null
          icms_base: number | null
          icms_retention: number | null
          id: string
          is_active: boolean
          item_type: string | null
          max_stock: number | null
          min_stock: number | null
          name: string
          ncm_code: string | null
          observations: string | null
          pis_fixed: number | null
          price: number
          product_group: string | null
          product_type: string | null
          production_type: string | null
          promotional_price: number | null
          short_description: string | null
          stock_location: string | null
          stock_notes: string | null
          stock_quantity: number
          tax_origin: string | null
          tax_situation: string | null
          tipi_exception: string | null
          unit: string | null
          unit_measure: string | null
          updated_at: string
          video_link: string | null
          volumes: number | null
          warehouse: string | null
          weight: number | null
          width: number | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          cest_code?: string | null
          code: string
          cofins_fixed?: number | null
          company_id: string
          condition?: string | null
          cost_price?: number | null
          created_at?: string
          crossdocking_days?: number | null
          depth?: number | null
          description?: string | null
          dimensions?: string | null
          estimated_tax_percentage?: number | null
          expiry_date?: string | null
          external_link?: string | null
          format?: string | null
          free_shipping?: boolean | null
          gross_weight?: number | null
          height?: number | null
          icms_base?: number | null
          icms_retention?: number | null
          id?: string
          is_active?: boolean
          item_type?: string | null
          max_stock?: number | null
          min_stock?: number | null
          name: string
          ncm_code?: string | null
          observations?: string | null
          pis_fixed?: number | null
          price?: number
          product_group?: string | null
          product_type?: string | null
          production_type?: string | null
          promotional_price?: number | null
          short_description?: string | null
          stock_location?: string | null
          stock_notes?: string | null
          stock_quantity?: number
          tax_origin?: string | null
          tax_situation?: string | null
          tipi_exception?: string | null
          unit?: string | null
          unit_measure?: string | null
          updated_at?: string
          video_link?: string | null
          volumes?: number | null
          warehouse?: string | null
          weight?: number | null
          width?: number | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          cest_code?: string | null
          code?: string
          cofins_fixed?: number | null
          company_id?: string
          condition?: string | null
          cost_price?: number | null
          created_at?: string
          crossdocking_days?: number | null
          depth?: number | null
          description?: string | null
          dimensions?: string | null
          estimated_tax_percentage?: number | null
          expiry_date?: string | null
          external_link?: string | null
          format?: string | null
          free_shipping?: boolean | null
          gross_weight?: number | null
          height?: number | null
          icms_base?: number | null
          icms_retention?: number | null
          id?: string
          is_active?: boolean
          item_type?: string | null
          max_stock?: number | null
          min_stock?: number | null
          name?: string
          ncm_code?: string | null
          observations?: string | null
          pis_fixed?: number | null
          price?: number
          product_group?: string | null
          product_type?: string | null
          production_type?: string | null
          promotional_price?: number | null
          short_description?: string | null
          stock_location?: string | null
          stock_notes?: string | null
          stock_quantity?: number
          tax_origin?: string | null
          tax_situation?: string | null
          tipi_exception?: string | null
          unit?: string | null
          unit_measure?: string | null
          updated_at?: string
          video_link?: string | null
          volumes?: number | null
          warehouse?: string | null
          weight?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          access_level_id: string | null
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          display_name: string
          document: string | null
          document_type: string | null
          email: string
          id: string
          is_active: boolean
          is_admin: boolean
          person_type: string | null
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
          zipcode: string | null
        }
        Insert: {
          access_level_id?: string | null
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name: string
          document?: string | null
          document_type?: string | null
          email: string
          id?: string
          is_active?: boolean
          is_admin?: boolean
          person_type?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          zipcode?: string | null
        }
        Update: {
          access_level_id?: string | null
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          document?: string | null
          document_type?: string | null
          email?: string
          id?: string
          is_active?: boolean
          is_admin?: boolean
          person_type?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          zipcode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_access_level_id_fkey"
            columns: ["access_level_id"]
            isOneToOne: false
            referencedRelation: "access_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      project_history: {
        Row: {
          build_status: string
          company_id: string
          created_at: string | null
          errors_fixed: string[] | null
          files_modified: string[] | null
          id: string
          impact_level: string
          prompt: string
          response: Json | null
          session_id: string
          similarity_hash: string
          tags: string[] | null
          technical_decisions: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          build_status?: string
          company_id: string
          created_at?: string | null
          errors_fixed?: string[] | null
          files_modified?: string[] | null
          id: string
          impact_level?: string
          prompt: string
          response?: Json | null
          session_id: string
          similarity_hash: string
          tags?: string[] | null
          technical_decisions?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          build_status?: string
          company_id?: string
          created_at?: string | null
          errors_fixed?: string[] | null
          files_modified?: string[] | null
          id?: string
          impact_level?: string
          prompt?: string
          response?: Json | null
          session_id?: string
          similarity_hash?: string
          tags?: string[] | null
          technical_decisions?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prompt_logs: {
        Row: {
          applied_at: string | null
          applied_files: Json | null
          company_id: string
          created_at: string | null
          error_message: string | null
          generated_code: Json | null
          id: string
          model_used: string | null
          prompt: string
          rollback_data: Json | null
          rolled_back_at: string | null
          status: string | null
          temperature: number | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          applied_files?: Json | null
          company_id: string
          created_at?: string | null
          error_message?: string | null
          generated_code?: Json | null
          id?: string
          model_used?: string | null
          prompt: string
          rollback_data?: Json | null
          rolled_back_at?: string | null
          status?: string | null
          temperature?: number | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          applied_files?: Json | null
          company_id?: string
          created_at?: string | null
          error_message?: string | null
          generated_code?: Json | null
          id?: string
          model_used?: string | null
          prompt?: string
          rollback_data?: Json | null
          rolled_back_at?: string | null
          status?: string | null
          temperature?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          accepted_at: string | null
          company_id: string
          converted_to_sale_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          delivery_terms: string | null
          description: string | null
          discount: number | null
          expiration_date: string | null
          id: string
          internal_notes: string | null
          items: Json
          notes: string | null
          payment_terms: string | null
          pdf_generated_at: string | null
          pdf_url: string | null
          proposal_number: string
          rejected_at: string | null
          sent_at: string | null
          services: Json | null
          status: string
          subtotal: number
          tax_amount: number | null
          title: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          converted_to_sale_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_terms?: string | null
          description?: string | null
          discount?: number | null
          expiration_date?: string | null
          id?: string
          internal_notes?: string | null
          items?: Json
          notes?: string | null
          payment_terms?: string | null
          pdf_generated_at?: string | null
          pdf_url?: string | null
          proposal_number: string
          rejected_at?: string | null
          sent_at?: string | null
          services?: Json | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          title: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          converted_to_sale_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_terms?: string | null
          description?: string | null
          discount?: number | null
          expiration_date?: string | null
          id?: string
          internal_notes?: string | null
          items?: Json
          notes?: string | null
          payment_terms?: string | null
          pdf_generated_at?: string | null
          pdf_url?: string | null
          proposal_number?: string
          rejected_at?: string | null
          sent_at?: string | null
          services?: Json | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          title?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          delivery_date: string | null
          discount: number | null
          id: string
          items: Json
          notes: string | null
          order_date: string
          order_number: string
          status: string
          subtotal: number
          supplier_id: string | null
          supplier_name: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          discount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_date?: string
          order_number: string
          status?: string
          subtotal?: number
          supplier_id?: string | null
          supplier_name?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          discount?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_date?: string
          order_number?: string
          status?: string
          subtotal?: number
          supplier_id?: string | null
          supplier_name?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          blocked_until: string | null
          created_at: string
          id: string
          identifier: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          blocked_until?: string | null
          created_at?: string
          id?: string
          identifier?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          chart_type: string
          company_id: string
          config: Json
          created_at: string
          created_by: string | null
          data_sources: string[]
          description: string | null
          filters: Json | null
          id: string
          is_active: boolean
          metrics: string[]
          name: string
          updated_at: string
        }
        Insert: {
          chart_type?: string
          company_id: string
          config?: Json
          created_at?: string
          created_by?: string | null
          data_sources?: string[]
          description?: string | null
          filters?: Json | null
          id?: string
          is_active?: boolean
          metrics?: string[]
          name: string
          updated_at?: string
        }
        Update: {
          chart_type?: string
          company_id?: string
          config?: Json
          created_at?: string
          created_by?: string | null
          data_sources?: string[]
          description?: string | null
          filters?: Json | null
          id?: string
          is_active?: boolean
          metrics?: string[]
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string
          discount: number | null
          id: string
          product_id: string
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          discount?: number | null
          id?: string
          product_id: string
          quantity: number
          sale_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          discount?: number | null
          id?: string
          product_id?: string
          quantity?: number
          sale_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_payments: {
        Row: {
          amount: number
          created_at: string
          details: string | null
          id: string
          payment_method: string
          sale_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          details?: string | null
          id?: string
          payment_method: string
          sale_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          details?: string | null
          id?: string
          payment_method?: string
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          company_id: string
          created_at: string
          customer_id: string | null
          discount: number | null
          id: string
          is_active: boolean | null
          nfce_number: string | null
          notes: string | null
          operator_id: string | null
          payment_method: string | null
          receipt_printed: boolean | null
          sale_date: string
          sale_number: string
          sale_type: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          customer_id?: string | null
          discount?: number | null
          id?: string
          is_active?: boolean | null
          nfce_number?: string | null
          notes?: string | null
          operator_id?: string | null
          payment_method?: string | null
          receipt_printed?: boolean | null
          sale_date?: string
          sale_number: string
          sale_type?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          customer_id?: string | null
          discount?: number | null
          id?: string
          is_active?: boolean | null
          nfce_number?: string | null
          notes?: string | null
          operator_id?: string | null
          payment_method?: string | null
          receipt_printed?: boolean | null
          sale_date?: string
          sale_number?: string
          sale_type?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_logs: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          risk_level: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          risk_level?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          risk_level?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      service_orders: {
        Row: {
          assigned_to: string | null
          company_id: string
          completion_date: string | null
          cost: number | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string
          estimated_hours: number | null
          id: string
          notes: string | null
          order_number: string
          price: number | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          completion_date?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description: string
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          order_number: string
          price?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          completion_date?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string
          estimated_hours?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          price?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      similarity_patterns: {
        Row: {
          created_at: string | null
          id: string
          pattern_data: Json | null
          pattern_hash: string
          pattern_type: string
          similarity_threshold: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pattern_data?: Json | null
          pattern_hash: string
          pattern_type: string
          similarity_threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pattern_data?: Json | null
          pattern_hash?: string
          pattern_type?: string
          similarity_threshold?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sla_acceptance: {
        Row: {
          accepted_at: string
          company_id: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          sla_id: string
          sla_url: string | null
          sla_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          company_id: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          sla_id: string
          sla_url?: string | null
          sla_version: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          company_id?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          sla_id?: string
          sla_url?: string | null
          sla_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sla_agreements: {
        Row: {
          compensations: Json | null
          content: string
          coverage_plans: Json
          created_at: string
          created_by: string | null
          effective_date: string
          id: string
          is_active: boolean
          support_response_hours: number
          title: string
          updated_at: string
          uptime_guarantee: number
          version: string
        }
        Insert: {
          compensations?: Json | null
          content: string
          coverage_plans?: Json
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean
          support_response_hours?: number
          title?: string
          updated_at?: string
          uptime_guarantee?: number
          version: string
        }
        Update: {
          compensations?: Json | null
          content?: string
          coverage_plans?: Json
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean
          support_response_hours?: number
          title?: string
          updated_at?: string
          uptime_guarantee?: number
          version?: string
        }
        Relationships: []
      }
      ssl_certificates: {
        Row: {
          certificate_issuer: string | null
          certificate_subject: string | null
          company_id: string | null
          created_at: string
          domain: string
          fingerprint: string | null
          id: string
          last_checked_at: string | null
          status: string
          tls_version: string | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          certificate_issuer?: string | null
          certificate_subject?: string | null
          company_id?: string | null
          created_at?: string
          domain: string
          fingerprint?: string | null
          id?: string
          last_checked_at?: string | null
          status?: string
          tls_version?: string | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          certificate_issuer?: string | null
          certificate_subject?: string | null
          company_id?: string | null
          created_at?: string
          domain?: string
          fingerprint?: string | null
          id?: string
          last_checked_at?: string | null
          status?: string
          tls_version?: string | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          new_quantity: number | null
          notes: string | null
          previous_quantity: number | null
          product_id: string
          quantity: number
          reference_type: string | null
          total_cost: number | null
          unit_cost: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          new_quantity?: number | null
          notes?: string | null
          previous_quantity?: number | null
          product_id: string
          quantity: number
          reference_type?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          new_quantity?: number | null
          notes?: string | null
          previous_quantity?: number | null
          product_id?: string
          quantity?: number
          reference_type?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_config: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string | null
          default_currency: string
          id: string
          is_active: boolean | null
          is_live_mode: boolean | null
          publishable_key: string | null
          stripe_publishable_key: string | null
          stripe_secret_key_encrypted: string | null
          stripe_webhook_secret_encrypted: string | null
          test_mode: boolean
          updated_at: string
          webhook_secret: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          default_currency?: string
          id?: string
          is_active?: boolean | null
          is_live_mode?: boolean | null
          publishable_key?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key_encrypted?: string | null
          stripe_webhook_secret_encrypted?: string | null
          test_mode?: boolean
          updated_at?: string
          webhook_secret?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string | null
          default_currency?: string
          id?: string
          is_active?: boolean | null
          is_live_mode?: boolean | null
          publishable_key?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key_encrypted?: string | null
          stripe_webhook_secret_encrypted?: string | null
          test_mode?: boolean
          updated_at?: string
          webhook_secret?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_products: {
        Row: {
          company_id: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          interval: string | null
          is_active: boolean | null
          name: string
          plan_id: string | null
          price: number
          stripe_price_id: string
          stripe_product_id: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          interval?: string | null
          is_active?: boolean | null
          name: string
          plan_id?: string | null
          price: number
          stripe_price_id: string
          stripe_product_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          interval?: string | null
          is_active?: boolean | null
          name?: string
          plan_id?: string | null
          price?: number
          stripe_price_id?: string
          stripe_product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_products_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_products_mapping: {
        Row: {
          company_id: string
          created_at: string
          id: string
          plan_id: string
          stripe_price_id: string
          stripe_product_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          plan_id: string
          stripe_price_id: string
          stripe_product_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          plan_id?: string
          stripe_price_id?: string
          stripe_product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_products_mapping_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_products_mapping_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subs_stripe: {
        Row: {
          attrs: Json | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer: string | null
          id: string | null
        }
        Insert: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Update: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_id: string | null
          subscription_tier: string | null
          trial_end: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_id?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_id?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          company_id: string
          created_at: string
          end_date: string | null
          id: string
          plan_id: string
          start_date: string
          status: string
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id: string
          start_date?: string
          status?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          plan_id?: string
          start_date?: string
          status?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          company_id: string
          contact_person: string | null
          created_at: string
          document: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          zipcode: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id: string
          contact_person?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zipcode?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string
          contact_person?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zipcode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health_logs: {
        Row: {
          created_at: string
          error_details: Json | null
          error_message: string | null
          id: string
          resolved_at: string | null
          response_time_ms: number | null
          service_name: string
          status: string
        }
        Insert: {
          created_at?: string
          error_details?: Json | null
          error_message?: string | null
          id?: string
          resolved_at?: string | null
          response_time_ms?: number | null
          service_name: string
          status: string
        }
        Update: {
          created_at?: string
          error_details?: Json | null
          error_message?: string | null
          id?: string
          resolved_at?: string | null
          response_time_ms?: number | null
          service_name?: string
          status?: string
        }
        Relationships: []
      }
      system_health_status: {
        Row: {
          average_response_time_ms: number | null
          consecutive_failures: number
          created_at: string
          current_status: string
          id: string
          last_check_at: string
          last_failure_at: string | null
          last_success_at: string | null
          service_name: string
          updated_at: string
          uptime_percentage: number | null
        }
        Insert: {
          average_response_time_ms?: number | null
          consecutive_failures?: number
          created_at?: string
          current_status?: string
          id?: string
          last_check_at?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          service_name: string
          updated_at?: string
          uptime_percentage?: number | null
        }
        Update: {
          average_response_time_ms?: number | null
          consecutive_failures?: number
          created_at?: string
          current_status?: string
          id?: string
          last_check_at?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          service_name?: string
          updated_at?: string
          uptime_percentage?: number | null
        }
        Relationships: []
      }
      terms_acceptance: {
        Row: {
          accepted_at: string
          company_id: string
          created_at: string
          id: string
          ip_address: unknown | null
          terms_id: string
          terms_url: string | null
          terms_version: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string
          company_id: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          terms_id: string
          terms_url?: string | null
          terms_version: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string
          company_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          terms_id?: string
          terms_url?: string | null
          terms_version?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terms_acceptance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terms_acceptance_terms_id_fkey"
            columns: ["terms_id"]
            isOneToOne: false
            referencedRelation: "terms_of_service"
            referencedColumns: ["id"]
          },
        ]
      }
      terms_of_service: {
        Row: {
          company_id: string | null
          content: string
          created_at: string
          created_by: string | null
          effective_date: string
          id: string
          is_active: boolean
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          company_id?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          version: string
        }
        Update: {
          company_id?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "terms_of_service_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      token_stripe: {
        Row: {
          attrs: Json | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer: string | null
          id: string | null
        }
        Insert: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Update: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          company_id: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subscriber_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          company_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subscriber_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          company_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subscriber_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_dashboards: {
        Row: {
          company_id: string
          created_at: string
          id: string
          layout_config: Json | null
          updated_at: string
          user_id: string
          widgets: Json
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          layout_config?: Json | null
          updated_at?: string
          user_id: string
          widgets?: Json
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          layout_config?: Json | null
          updated_at?: string
          user_id?: string
          widgets?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: number
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          address: string | null
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      potential_duplicate_policies: {
        Row: {
          policyname: unknown | null
          roles: unknown[] | null
          schemaname: unknown | null
        }
        Relationships: []
      }
      unused_indexes: {
        Row: {
          indexrelname: unknown | null
          relname: unknown | null
          schemaname: unknown | null
        }
        Relationships: []
      }
    }
    Functions: {
      agendar_proxima_auditoria: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      analyze_database_performance: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          item: string
          status: string
          recommendation: string
        }[]
      }
      automated_security_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      can_access_company_data: {
        Args: { company_uuid: string }
        Returns: boolean
      }
      can_bypass_all_restrictions: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_manage_company_data: {
        Args: { company_uuid: string }
        Returns: boolean
      }
      check_document_uniqueness: {
        Args: { doc: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_request: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_ssl_certificate_expiry: {
        Args: Record<PropertyKey, never>
        Returns: {
          domain: string
          days_until_expiry: number
          status: string
        }[]
      }
      cleanup_old_security_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_project_history: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_alert: {
        Args: {
          p_company_id: string
          p_type: string
          p_title: string
          p_description: string
          p_severity?: string
          p_metadata?: Json
        }
        Returns: string
      }
      create_analytics_event: {
        Args:
          | { event_type: string; event_data?: Json }
          | {
              p_event_name: string
              p_device_type?: string
              p_route?: string
              p_duration_ms?: number
              p_meta?: Json
            }
        Returns: Json
      }
      create_app_version: {
        Args: {
          p_version_number: string
          p_git_sha: string
          p_git_branch: string
          p_environment: string
          p_deployed_by?: string
          p_release_notes?: string
          p_metadata?: Json
        }
        Returns: string
      }
      create_audit_log: {
        Args: {
          p_company_id: string
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_old_values?: Json
          p_new_values?: Json
          p_ip_address?: unknown
          p_user_agent?: string
          p_severity?: string
          p_status?: string
          p_details?: Json
        }
        Returns: string
      }
      create_lgpd_request: {
        Args: { p_company_id: string; p_request_type: string; p_notes?: string }
        Returns: string
      }
      create_marketplace_webhook: {
        Args: {
          p_integration_id: string
          p_marketplace: string
          p_webhook_url: string
        }
        Returns: string
      }
      create_privacy_consent: {
        Args: {
          p_company_id: string
          p_accepted: boolean
          p_ip_address?: unknown
          p_user_agent?: string
          p_version?: string
          p_consent_type?: string
          p_metadata?: Json
        }
        Returns: string
      }
      create_sla_acceptance: {
        Args: {
          p_company_id: string
          p_sla_id: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_sla_url?: string
        }
        Returns: string
      }
      create_system_alert: {
        Args: {
          p_service_name: string
          p_error_message: string
          p_metadata?: Json
        }
        Returns: string
      }
      create_terms_acceptance: {
        Args: {
          p_company_id: string
          p_terms_id: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_terms_url?: string
        }
        Returns: string
      }
      encrypt_sensitive_data: {
        Args: { data_to_encrypt: string; encryption_key: string }
        Returns: string
      }
      executar_auditoria_automatica: {
        Args: { p_company_id: string }
        Returns: string
      }
      export_user_data: {
        Args: { p_user_id?: string; p_company_id?: string }
        Returns: Json
      }
      generate_contract_number: {
        Args: Record<PropertyKey, never> | { company_uuid: string }
        Returns: string
      }
      generate_nfe_access_key: {
        Args: {
          company_cnpj: string
          serie_nfe: string
          numero_nfe: string
          emission_date?: string
        }
        Returns: string
      }
      generate_nfe_number: {
        Args: { company_uuid: string; serie_nfe?: string }
        Returns: string
      }
      generate_pos_sale_number: {
        Args: Record<PropertyKey, never> | { company_uuid: string }
        Returns: string
      }
      generate_proposal_number: {
        Args: Record<PropertyKey, never> | { company_uuid: string }
        Returns: string
      }
      generate_purchase_order_number: {
        Args: Record<PropertyKey, never> | { company_id: string }
        Returns: string
      }
      generate_sale_number: {
        Args: { company_uuid: string; sale_type_param?: string }
        Returns: string
      }
      get_analytics_metrics: {
        Args: {
          p_start_date?: string
          p_end_date?: string
          p_event_filter?: string
        }
        Returns: {
          total_events: number
          unique_users: number
          top_events: Json
          events_by_day: Json
          device_breakdown: Json
          route_breakdown: Json
        }[]
      }
      get_audit_logs: {
        Args: {
          p_company_id?: string
          p_user_id?: string
          p_action?: string
          p_resource_type?: string
          p_severity?: string
          p_start_date?: string
          p_end_date?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          company_id: string
          user_id: string
          user_email: string
          user_name: string
          action: string
          resource_type: string
          resource_id: string
          old_values: Json
          new_values: Json
          ip_address: unknown
          user_agent: string
          severity: string
          status: string
          details: Json
          created_at: string
        }[]
      }
      get_current_user_type: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_type"]
      }
      get_current_version: {
        Args: { p_environment?: string }
        Returns: {
          version_number: string
          git_sha: string
          git_branch: string
          deployed_at: string
          deployed_by: string
        }[]
      }
      get_default_company_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_security_config: {
        Args: { p_config_key: string }
        Returns: Json
      }
      get_system_health: {
        Args: Record<PropertyKey, never>
        Returns: {
          overall_status: string
          services: Json
          uptime: string
          last_check: string
        }[]
      }
      get_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_permissions: {
        Args: { user_uuid: string }
        Returns: Json
      }
      has_permission: {
        Args: { permission_key: string }
        Returns: boolean
      }
      has_specific_permission: {
        Args: { permission_key: string; company_uuid?: string }
        Returns: boolean
      }
      is_company_contratante: {
        Args: { company_uuid: string }
        Returns: boolean
      }
      is_contratante: {
        Args: { company_uuid?: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_operador: {
        Args: { company_uuid?: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_duplicate_document_attempt: {
        Args: {
          p_user_id: string
          p_document: string
          p_email: string
          p_ip_address?: unknown
        }
        Returns: string
      }
      log_health_check: {
        Args: {
          p_service_name: string
          p_status: string
          p_response_time_ms?: number
          p_error_message?: string
          p_error_details?: Json
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_event_type: string
          p_user_id?: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_event_data?: Json
          p_risk_level?: string
        }
        Returns: string
      }
      register_stock_movement: {
        Args: {
          p_product_id: string
          p_movement_type: string
          p_quantity: number
          p_unit_cost?: number
          p_reason?: string
          p_reference_type?: string
          p_reference_id?: string
          p_warehouse_from?: string
          p_warehouse_to?: string
        }
        Returns: string
      }
      resolve_alert: {
        Args: { p_alert_id: string; p_resolution_notes?: string }
        Returns: boolean
      }
      setup_initial_super_admin: {
        Args: { p_email: string }
        Returns: string
      }
      trigger_manual_backup: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_security_config: {
        Args: {
          p_config_key: string
          p_config_value: Json
          p_description?: string
        }
        Returns: boolean
      }
      user_has_accepted_current_terms: {
        Args: { p_user_id: string; p_company_id: string }
        Returns: boolean
      }
      validate_admin_action: {
        Args: { p_action: string; p_user_id?: string }
        Returns: boolean
      }
      validate_cnpj: {
        Args: { cnpj_input: string }
        Returns: boolean
      }
      validate_document: {
        Args: { doc: string; doc_type: string }
        Returns: boolean
      }
      validate_password: {
        Args: { password: string }
        Returns: boolean
      }
      validate_sensitive_operation: {
        Args: {
          p_operation: string
          p_resource_type: string
          p_resource_id?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_type: "super_admin" | "contratante" | "operador"
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
      user_type: ["super_admin", "contratante", "operador"],
    },
  },
} as const
