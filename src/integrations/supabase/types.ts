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
      accounts_payable: {
        Row: {
          amount: number
          category: string | null
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
          category?: string | null
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
          category?: string | null
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
          payment_method: string | null
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
          payment_method?: string | null
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
          payment_method?: string | null
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
      companies: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          document: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          zipcode: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          document: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zipcode?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          document?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zipcode?: string | null
        }
        Relationships: []
      }
      company_integrations: {
        Row: {
          company_id: string
          config: Json | null
          created_at: string
          credentials: Json | null
          id: string
          integration_id: string
          is_active: boolean | null
          last_tested: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          config?: Json | null
          created_at?: string
          credentials?: Json | null
          id?: string
          integration_id: string
          is_active?: boolean | null
          last_tested?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          config?: Json | null
          created_at?: string
          credentials?: Json | null
          id?: string
          integration_id?: string
          is_active?: boolean | null
          last_tested?: string | null
          updated_at?: string
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
          branding: Json | null
          certificado_base64: string | null
          certificado_nome: string | null
          certificado_senha: string | null
          certificado_status: string | null
          certificado_validade: string | null
          cfop_padrao: string | null
          company_id: string
          conta_padrao: string | null
          created_at: string | null
          crossdocking_padrao: number | null
          estoque_tolerancia_minima: number | null
          formas_pagamento_ativas: Json | null
          funcionalidades_ativas: Json | null
          id: string
          idioma: string | null
          impostos_padrao: Json | null
          moeda: string | null
          nfe_api_token: string | null
          nfe_cnpj: string | null
          nfe_environment: string | null
          notificacoes: Json | null
          regime_tributario: string | null
          serie_nfe: string | null
          stripe_products: Json | null
          stripe_secret_key: string | null
          timezone: string | null
          updated_at: string | null
          webhooks: Json | null
        }
        Insert: {
          branding?: Json | null
          certificado_base64?: string | null
          certificado_nome?: string | null
          certificado_senha?: string | null
          certificado_status?: string | null
          certificado_validade?: string | null
          cfop_padrao?: string | null
          company_id: string
          conta_padrao?: string | null
          created_at?: string | null
          crossdocking_padrao?: number | null
          estoque_tolerancia_minima?: number | null
          formas_pagamento_ativas?: Json | null
          funcionalidades_ativas?: Json | null
          id?: string
          idioma?: string | null
          impostos_padrao?: Json | null
          moeda?: string | null
          nfe_api_token?: string | null
          nfe_cnpj?: string | null
          nfe_environment?: string | null
          notificacoes?: Json | null
          regime_tributario?: string | null
          serie_nfe?: string | null
          stripe_products?: Json | null
          stripe_secret_key?: string | null
          timezone?: string | null
          updated_at?: string | null
          webhooks?: Json | null
        }
        Update: {
          branding?: Json | null
          certificado_base64?: string | null
          certificado_nome?: string | null
          certificado_senha?: string | null
          certificado_status?: string | null
          certificado_validade?: string | null
          cfop_padrao?: string | null
          company_id?: string
          conta_padrao?: string | null
          created_at?: string | null
          crossdocking_padrao?: number | null
          estoque_tolerancia_minima?: number | null
          formas_pagamento_ativas?: Json | null
          funcionalidades_ativas?: Json | null
          id?: string
          idioma?: string | null
          impostos_padrao?: Json | null
          moeda?: string | null
          nfe_api_token?: string | null
          nfe_cnpj?: string | null
          nfe_environment?: string | null
          notificacoes?: Json | null
          regime_tributario?: string | null
          serie_nfe?: string | null
          stripe_products?: Json | null
          stripe_secret_key?: string | null
          timezone?: string | null
          updated_at?: string | null
          webhooks?: Json | null
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
      integrations: {
        Row: {
          api_credentials: Json | null
          company_id: string
          created_at: string
          id: string
          integration_available_id: string | null
          integration_type: string
          is_active: boolean
          last_sync: string | null
          platform_name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          api_credentials?: Json | null
          company_id: string
          created_at?: string
          id?: string
          integration_available_id?: string | null
          integration_type: string
          is_active?: boolean
          last_sync?: string | null
          platform_name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          api_credentials?: Json | null
          company_id?: string
          created_at?: string
          id?: string
          integration_available_id?: string | null
          integration_type?: string
          is_active?: boolean
          last_sync?: string | null
          platform_name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integrations_integration_available_id_fkey"
            columns: ["integration_available_id"]
            isOneToOne: false
            referencedRelation: "integrations_available"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations_available: {
        Row: {
          available_for_plans: string[] | null
          config_schema: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_global_only: boolean | null
          logo_url: string | null
          name: string
          type: string
          updated_at: string | null
          visible_to_companies: boolean | null
        }
        Insert: {
          available_for_plans?: string[] | null
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_global_only?: boolean | null
          logo_url?: string | null
          name: string
          type: string
          updated_at?: string | null
          visible_to_companies?: boolean | null
        }
        Update: {
          available_for_plans?: string[] | null
          config_schema?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_global_only?: boolean | null
          logo_url?: string | null
          name?: string
          type?: string
          updated_at?: string | null
          visible_to_companies?: boolean | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          access_key: string | null
          company_id: string
          created_at: string
          customer_id: string | null
          id: string
          invoice_number: string
          invoice_type: string
          issue_date: string
          protocol_number: string | null
          sale_id: string | null
          series: string | null
          status: string
          tax_amount: number | null
          total_amount: number
          updated_at: string
          xml_content: string | null
        }
        Insert: {
          access_key?: string | null
          company_id: string
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_number: string
          invoice_type: string
          issue_date?: string
          protocol_number?: string | null
          sale_id?: string | null
          series?: string | null
          status?: string
          tax_amount?: number | null
          total_amount: number
          updated_at?: string
          xml_content?: string | null
        }
        Update: {
          access_key?: string | null
          company_id?: string
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_number?: string
          invoice_type?: string
          issue_date?: string
          protocol_number?: string | null
          sale_id?: string | null
          series?: string | null
          status?: string
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          xml_content?: string | null
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
      plans: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_custom: boolean | null
          is_whitelabel: boolean | null
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
          is_custom?: boolean | null
          is_whitelabel?: boolean | null
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
          is_custom?: boolean | null
          is_whitelabel?: boolean | null
          name?: string
          price?: number
          trial_days?: number | null
          updated_at?: string
          user_limit?: number | null
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
          additional_tax_data: Json | null
          barcode: string | null
          brand: string | null
          category_id: string | null
          cest_code: string | null
          code: string
          cofins_fixed_value: number | null
          company_id: string
          condition: string | null
          cost_price: number | null
          created_at: string
          crossdocking_days: number | null
          custom_attributes: Json | null
          depth: number | null
          description: string | null
          dimensions: string | null
          estimated_taxes_percentage: number | null
          expiry_date: string | null
          external_id: string | null
          external_link: string | null
          format: string | null
          free_shipping: boolean | null
          gross_weight: number | null
          gtin: string | null
          gtin_tax: string | null
          height: number | null
          icms_base: number | null
          icms_retention: number | null
          id: string
          images: Json | null
          initial_stock: number | null
          integration_data: Json | null
          is_active: boolean
          item_type: string | null
          main_image_url: string | null
          max_stock: number | null
          min_stock: number | null
          name: string
          ncm_code: string | null
          observations: string | null
          pis_fixed_value: number | null
          price: number
          price_list: Json | null
          product_group: string | null
          product_type: string | null
          production_type: string | null
          promotional_date_end: string | null
          promotional_date_start: string | null
          promotional_price: number | null
          short_description: string | null
          stock_location: string | null
          stock_notes: string | null
          stock_quantity: number
          suppliers: Json | null
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
          additional_tax_data?: Json | null
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          cest_code?: string | null
          code: string
          cofins_fixed_value?: number | null
          company_id: string
          condition?: string | null
          cost_price?: number | null
          created_at?: string
          crossdocking_days?: number | null
          custom_attributes?: Json | null
          depth?: number | null
          description?: string | null
          dimensions?: string | null
          estimated_taxes_percentage?: number | null
          expiry_date?: string | null
          external_id?: string | null
          external_link?: string | null
          format?: string | null
          free_shipping?: boolean | null
          gross_weight?: number | null
          gtin?: string | null
          gtin_tax?: string | null
          height?: number | null
          icms_base?: number | null
          icms_retention?: number | null
          id?: string
          images?: Json | null
          initial_stock?: number | null
          integration_data?: Json | null
          is_active?: boolean
          item_type?: string | null
          main_image_url?: string | null
          max_stock?: number | null
          min_stock?: number | null
          name: string
          ncm_code?: string | null
          observations?: string | null
          pis_fixed_value?: number | null
          price?: number
          price_list?: Json | null
          product_group?: string | null
          product_type?: string | null
          production_type?: string | null
          promotional_date_end?: string | null
          promotional_date_start?: string | null
          promotional_price?: number | null
          short_description?: string | null
          stock_location?: string | null
          stock_notes?: string | null
          stock_quantity?: number
          suppliers?: Json | null
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
          additional_tax_data?: Json | null
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          cest_code?: string | null
          code?: string
          cofins_fixed_value?: number | null
          company_id?: string
          condition?: string | null
          cost_price?: number | null
          created_at?: string
          crossdocking_days?: number | null
          custom_attributes?: Json | null
          depth?: number | null
          description?: string | null
          dimensions?: string | null
          estimated_taxes_percentage?: number | null
          expiry_date?: string | null
          external_id?: string | null
          external_link?: string | null
          format?: string | null
          free_shipping?: boolean | null
          gross_weight?: number | null
          gtin?: string | null
          gtin_tax?: string | null
          height?: number | null
          icms_base?: number | null
          icms_retention?: number | null
          id?: string
          images?: Json | null
          initial_stock?: number | null
          integration_data?: Json | null
          is_active?: boolean
          item_type?: string | null
          main_image_url?: string | null
          max_stock?: number | null
          min_stock?: number | null
          name?: string
          ncm_code?: string | null
          observations?: string | null
          pis_fixed_value?: number | null
          price?: number
          price_list?: Json | null
          product_group?: string | null
          product_type?: string | null
          production_type?: string | null
          promotional_date_end?: string | null
          promotional_date_start?: string | null
          promotional_price?: number | null
          short_description?: string | null
          stock_location?: string | null
          stock_notes?: string | null
          stock_quantity?: number
          suppliers?: Json | null
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
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
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
      sales: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          discount: number | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_terms: string | null
          sale_date: string
          sale_number: string
          shipping_cost: number | null
          status: string
          subtotal: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          sale_date?: string
          sale_number: string
          shipping_cost?: number | null
          status?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          sale_date?: string
          sale_number?: string
          shipping_cost?: number | null
          status?: string
          subtotal?: number
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
      service_orders: {
        Row: {
          actual_hours: number | null
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
          priority: string | null
          service_type: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
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
          priority?: string | null
          service_type?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
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
          priority?: string | null
          service_type?: string | null
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
      stock_movements: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          id: string
          movement_type: string
          notes: string | null
          product_id: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          product_id: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
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
      subscriptions: {
        Row: {
          company_id: string
          created_at: string
          end_date: string | null
          id: string
          payment_method: string | null
          plan_id: string
          price_paid: number | null
          start_date: string
          status: string
          stripe_subscription_id: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          payment_method?: string | null
          plan_id: string
          price_paid?: number | null
          start_date?: string
          status?: string
          stripe_subscription_id?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          payment_method?: string | null
          plan_id?: string
          price_paid?: number | null
          start_date?: string
          status?: string
          stripe_subscription_id?: string | null
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
      user_companies: {
        Row: {
          company_id: string
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean
          last_login: string | null
          permissions: Json | null
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          last_login?: string | null
          permissions?: Json | null
          role?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          last_login?: string | null
          permissions?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_companies_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrypt_integration_data: {
        Args: { encrypted_data: string }
        Returns: Json
      }
      encrypt_integration_data: {
        Args: { data: Json }
        Returns: string
      }
      get_default_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
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
