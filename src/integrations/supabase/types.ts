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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          ip_address: string | null
          is_spam: boolean | null
          spam_reason: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          is_spam?: boolean | null
          spam_reason?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          is_spam?: boolean | null
          spam_reason?: string | null
        }
        Relationships: []
      }
      customer_applications: {
        Row: {
          account_holder_name: string | null
          account_number: string | null
          admin_notes: string | null
          backup_trailer_id: string | null
          bank_name: string | null
          billing_address: string | null
          business_needs: string | null
          business_type: string | null
          company_address: string | null
          company_id: string | null
          consent_autopay: boolean | null
          consent_communications: boolean | null
          consent_credit_check: boolean | null
          contract_url: string | null
          created_at: string
          date_needed: string | null
          drivers_license_url: string | null
          id: string
          insurance_company: string | null
          insurance_docs_url: string | null
          mc_dot_number: string | null
          message: string | null
          number_of_trailers: number | null
          payment_method: string | null
          phone_number: string
          prepay_full_year: boolean | null
          primary_trailer_id: string | null
          rental_start_date: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          routing_number: string | null
          secondary_contact_name: string | null
          secondary_contact_phone: string | null
          secondary_contact_relationship: string | null
          ssn_card_url: string | null
          status: string
          stripe_customer_id: string | null
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          trailer_type: string | null
          truck_vin: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_holder_name?: string | null
          account_number?: string | null
          admin_notes?: string | null
          backup_trailer_id?: string | null
          bank_name?: string | null
          billing_address?: string | null
          business_needs?: string | null
          business_type?: string | null
          company_address?: string | null
          company_id?: string | null
          consent_autopay?: boolean | null
          consent_communications?: boolean | null
          consent_credit_check?: boolean | null
          contract_url?: string | null
          created_at?: string
          date_needed?: string | null
          drivers_license_url?: string | null
          id?: string
          insurance_company?: string | null
          insurance_docs_url?: string | null
          mc_dot_number?: string | null
          message?: string | null
          number_of_trailers?: number | null
          payment_method?: string | null
          phone_number: string
          prepay_full_year?: boolean | null
          primary_trailer_id?: string | null
          rental_start_date?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          routing_number?: string | null
          secondary_contact_name?: string | null
          secondary_contact_phone?: string | null
          secondary_contact_relationship?: string | null
          ssn_card_url?: string | null
          status?: string
          stripe_customer_id?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          trailer_type?: string | null
          truck_vin?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string | null
          admin_notes?: string | null
          backup_trailer_id?: string | null
          bank_name?: string | null
          billing_address?: string | null
          business_needs?: string | null
          business_type?: string | null
          company_address?: string | null
          company_id?: string | null
          consent_autopay?: boolean | null
          consent_communications?: boolean | null
          consent_credit_check?: boolean | null
          contract_url?: string | null
          created_at?: string
          date_needed?: string | null
          drivers_license_url?: string | null
          id?: string
          insurance_company?: string | null
          insurance_docs_url?: string | null
          mc_dot_number?: string | null
          message?: string | null
          number_of_trailers?: number | null
          payment_method?: string | null
          phone_number?: string
          prepay_full_year?: boolean | null
          primary_trailer_id?: string | null
          rental_start_date?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          routing_number?: string | null
          secondary_contact_name?: string | null
          secondary_contact_phone?: string | null
          secondary_contact_relationship?: string | null
          ssn_card_url?: string | null
          status?: string
          stripe_customer_id?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          trailer_type?: string | null
          truck_vin?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_applications_backup_trailer_id_fkey"
            columns: ["backup_trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_applications_primary_trailer_id_fkey"
            columns: ["primary_trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_outreach_status: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          last_password_reminder_at: string | null
          last_profile_reminder_at: string | null
          password_set_at: string | null
          profile_completed_at: string | null
          reminder_count: number | null
          unsubscribed: boolean | null
          unsubscribed_at: string | null
          updated_at: string
          welcome_sent_at: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          last_password_reminder_at?: string | null
          last_profile_reminder_at?: string | null
          password_set_at?: string | null
          profile_completed_at?: string | null
          reminder_count?: number | null
          unsubscribed?: boolean | null
          unsubscribed_at?: string | null
          updated_at?: string
          welcome_sent_at?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          last_password_reminder_at?: string | null
          last_profile_reminder_at?: string | null
          password_set_at?: string | null
          profile_completed_at?: string | null
          reminder_count?: number | null
          unsubscribed?: boolean | null
          unsubscribed_at?: string | null
          updated_at?: string
          welcome_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_outreach_status_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          account_number: string
          archived_at: string | null
          archived_by: string | null
          birthday: string | null
          city: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          notes: string | null
          payment_type: string | null
          phone: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          zip: string | null
        }
        Insert: {
          account_number: string
          archived_at?: string | null
          archived_by?: string | null
          birthday?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          payment_type?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Update: {
          account_number?: string
          archived_at?: string | null
          archived_by?: string | null
          birthday?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          payment_type?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          body: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          custom_recipients: string[] | null
          failed_count: number | null
          id: string
          name: string
          recipient_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          status: string
          subject: string | null
          target_audience: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          custom_recipients?: string[] | null
          failed_count?: number | null
          id?: string
          name: string
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string
          subject?: string | null
          target_audience?: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          custom_recipients?: string[] | null
          failed_count?: number | null
          id?: string
          name?: string
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string
          subject?: string | null
          target_audience?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          subject: string
          template_type: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          subject: string
          template_type?: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          created_at: string
          id: string
          referrer: string | null
          url: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referrer?: string | null
          url: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referrer?: string | null
          url?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_count: number
          created_at: string
          email: string
          id: string
          last_attempt_at: string
          locked_until: string | null
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          email: string
          id?: string
          last_attempt_at?: string
          locked_until?: string | null
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          email?: string
          id?: string
          last_attempt_at?: string
          locked_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_records: {
        Row: {
          completed: boolean | null
          cost: number
          created_at: string
          description: string
          id: string
          maintenance_date: string
          maintenance_type: string | null
          mechanic_id: string | null
          reported_by: string | null
          source: string | null
          status: string | null
          trailer_id: string
          updated_at: string
        }
        Insert: {
          completed?: boolean | null
          cost?: number
          created_at?: string
          description: string
          id?: string
          maintenance_date: string
          maintenance_type?: string | null
          mechanic_id?: string | null
          reported_by?: string | null
          source?: string | null
          status?: string | null
          trailer_id: string
          updated_at?: string
        }
        Update: {
          completed?: boolean | null
          cost?: number
          created_at?: string
          description?: string
          id?: string
          maintenance_date?: string
          maintenance_type?: string | null
          mechanic_id?: string | null
          reported_by?: string | null
          source?: string | null
          status?: string | null
          trailer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_mechanic_id_fkey"
            columns: ["mechanic_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_trailer_id_fkey"
            columns: ["trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          toll_id: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          toll_id: string
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          toll_id?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_toll_id_fkey"
            columns: ["toll_id"]
            isOneToOne: false
            referencedRelation: "tolls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_logs: {
        Row: {
          campaign_id: string | null
          created_at: string
          customer_id: string | null
          email: string
          email_type: string
          error_message: string | null
          id: string
          sent_at: string | null
          status: string
          template_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          customer_id?: string | null
          email: string
          email_type?: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          template_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string
          email_type?: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_logs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          company_name: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          email_notifications_enabled: boolean | null
          first_name: string | null
          home_address: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          email_notifications_enabled?: boolean | null
          first_name?: string | null
          home_address?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          company_name?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          email_notifications_enabled?: boolean | null
          first_name?: string | null
          home_address?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      redirects: {
        Row: {
          created_at: string | null
          hit_count: number | null
          id: string
          is_active: boolean | null
          source_path: string
          target_path: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          hit_count?: number | null
          id?: string
          is_active?: boolean | null
          source_path: string
          target_path: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          hit_count?: number | null
          id?: string
          is_active?: boolean | null
          source_path?: string
          target_path?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          customer_id: string
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          customer_id: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          credit_amount: number | null
          credited_at: string | null
          id: string
          notes: string | null
          referred_customer_id: string | null
          referred_email: string
          referrer_code_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          credit_amount?: number | null
          credited_at?: string | null
          id?: string
          notes?: string | null
          referred_customer_id?: string | null
          referred_email: string
          referrer_code_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          credit_amount?: number | null
          credited_at?: string | null
          id?: string
          notes?: string | null
          referred_customer_id?: string | null
          referred_email?: string
          referrer_code_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_customer_id_fkey"
            columns: ["referred_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_code_id_fkey"
            columns: ["referrer_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          company_id: string
          created_at: string
          description: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          created_at?: string
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tolls: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          created_by: string | null
          customer_id: string
          id: string
          notes: string | null
          payment_date: string | null
          receipt_url: string | null
          status: string
          toll_authority: string | null
          toll_date: string
          toll_location: string | null
          trailer_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          receipt_url?: string | null
          status?: string
          toll_authority?: string | null
          toll_date: string
          toll_location?: string | null
          trailer_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          receipt_url?: string | null
          status?: string
          toll_authority?: string | null
          toll_date?: string
          toll_location?: string | null
          trailer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tolls_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tolls_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tolls_trailer_id_fkey"
            columns: ["trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
        ]
      }
      trailers: {
        Row: {
          assigned_to: string | null
          company_id: string
          created_at: string
          customer_id: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          is_rented: boolean | null
          last_location_update: string | null
          license_plate: string | null
          make: string | null
          model: string | null
          notes: string | null
          purchase_price: number | null
          rental_income: number | null
          status: string
          total_maintenance_cost: number | null
          trailer_number: string
          type: string
          updated_at: string
          vin: string | null
          year: number | null
          year_purchased: number | null
        }
        Insert: {
          assigned_to?: string | null
          company_id: string
          created_at?: string
          customer_id?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          is_rented?: boolean | null
          last_location_update?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          notes?: string | null
          purchase_price?: number | null
          rental_income?: number | null
          status?: string
          total_maintenance_cost?: number | null
          trailer_number: string
          type: string
          updated_at?: string
          vin?: string | null
          year?: number | null
          year_purchased?: number | null
        }
        Update: {
          assigned_to?: string | null
          company_id?: string
          created_at?: string
          customer_id?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          is_rented?: boolean | null
          last_location_update?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          notes?: string | null
          purchase_price?: number | null
          rental_income?: number | null
          status?: string
          total_maintenance_cost?: number | null
          trailer_number?: string
          type?: string
          updated_at?: string
          vin?: string | null
          year?: number | null
          year_purchased?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trailers_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trailers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trailers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      customer_application_safe: {
        Row: {
          account_holder_name: string | null
          account_number_masked: string | null
          admin_notes: string | null
          backup_trailer_id: string | null
          bank_name: string | null
          billing_address: string | null
          business_needs: string | null
          business_type: string | null
          company_address: string | null
          company_id: string | null
          consent_autopay: boolean | null
          consent_communications: boolean | null
          consent_credit_check: boolean | null
          created_at: string | null
          date_needed: string | null
          has_contract: boolean | null
          has_drivers_license: boolean | null
          has_insurance_docs: boolean | null
          has_ssn_card: boolean | null
          id: string | null
          insurance_company: string | null
          mc_dot_number: string | null
          message: string | null
          number_of_trailers: number | null
          payment_method: string | null
          phone_number: string | null
          prepay_full_year: boolean | null
          primary_trailer_id: string | null
          rental_start_date: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          routing_number_masked: string | null
          secondary_contact_name: string | null
          secondary_contact_phone: string | null
          secondary_contact_relationship: string | null
          status: string | null
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          trailer_type: string | null
          truck_vin: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_holder_name?: string | null
          account_number_masked?: never
          admin_notes?: string | null
          backup_trailer_id?: string | null
          bank_name?: string | null
          billing_address?: string | null
          business_needs?: string | null
          business_type?: string | null
          company_address?: string | null
          company_id?: string | null
          consent_autopay?: boolean | null
          consent_communications?: boolean | null
          consent_credit_check?: boolean | null
          created_at?: string | null
          date_needed?: string | null
          has_contract?: never
          has_drivers_license?: never
          has_insurance_docs?: never
          has_ssn_card?: never
          id?: string | null
          insurance_company?: string | null
          mc_dot_number?: string | null
          message?: string | null
          number_of_trailers?: number | null
          payment_method?: string | null
          phone_number?: string | null
          prepay_full_year?: boolean | null
          primary_trailer_id?: string | null
          rental_start_date?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          routing_number_masked?: never
          secondary_contact_name?: string | null
          secondary_contact_phone?: string | null
          secondary_contact_relationship?: string | null
          status?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          trailer_type?: string | null
          truck_vin?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_holder_name?: string | null
          account_number_masked?: never
          admin_notes?: string | null
          backup_trailer_id?: string | null
          bank_name?: string | null
          billing_address?: string | null
          business_needs?: string | null
          business_type?: string | null
          company_address?: string | null
          company_id?: string | null
          consent_autopay?: boolean | null
          consent_communications?: boolean | null
          consent_credit_check?: boolean | null
          created_at?: string | null
          date_needed?: string | null
          has_contract?: never
          has_drivers_license?: never
          has_insurance_docs?: never
          has_ssn_card?: never
          id?: string | null
          insurance_company?: string | null
          mc_dot_number?: string | null
          message?: string | null
          number_of_trailers?: number | null
          payment_method?: string | null
          phone_number?: string | null
          prepay_full_year?: boolean | null
          primary_trailer_id?: string | null
          rental_start_date?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          routing_number_masked?: never
          secondary_contact_name?: string | null
          secondary_contact_phone?: string | null
          secondary_contact_relationship?: string | null
          status?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          trailer_type?: string | null
          truck_vin?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_applications_backup_trailer_id_fkey"
            columns: ["backup_trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_applications_primary_trailer_id_fkey"
            columns: ["primary_trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_login_attempt: { Args: { p_email: string }; Returns: Json }
      create_referral: {
        Args: { p_referral_code: string; p_referred_email: string }
        Returns: Json
      }
      generate_account_number: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      record_failed_login: { Args: { p_email: string }; Returns: Json }
      reset_login_attempts: { Args: { p_email: string }; Returns: undefined }
      set_user_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
      validate_referral_code: { Args: { p_code: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "customer" | "mechanic"
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
      app_role: ["admin", "customer", "mechanic"],
    },
  },
} as const
