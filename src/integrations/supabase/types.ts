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
      app_event_logs: {
        Row: {
          created_at: string
          description: string | null
          event_category: string
          event_type: string
          id: string
          metadata: Json | null
          page_url: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_category: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_category?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      applied_discounts: {
        Row: {
          applied_at: string
          discount_id: string
          id: string
          subscription_id: string
        }
        Insert: {
          applied_at?: string
          discount_id: string
          id?: string
          subscription_id: string
        }
        Update: {
          applied_at?: string
          discount_id?: string
          id?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applied_discounts_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applied_discounts_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "customer_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_history: {
        Row: {
          amount: number
          billing_period_end: string | null
          billing_period_start: string | null
          created_at: string
          discount_amount: number | null
          failure_reason: string | null
          id: string
          net_amount: number
          paid_at: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string
          discount_amount?: number | null
          failure_reason?: string | null
          id?: string
          net_amount: number
          paid_at?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string
          discount_amount?: number | null
          failure_reason?: string | null
          id?: string
          net_amount?: number
          paid_at?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "customer_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
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
          current_page: string | null
          email: string | null
          id: string
          ip_address: string | null
          is_spam: boolean | null
          landing_page: string | null
          referrer: string | null
          spam_reason: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string | null
          current_page?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          is_spam?: boolean | null
          landing_page?: string | null
          referrer?: string | null
          spam_reason?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string | null
          current_page?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          is_spam?: boolean | null
          landing_page?: string | null
          referrer?: string | null
          spam_reason?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: []
      }
      customer_applications: {
        Row: {
          admin_notes: string | null
          billing_anchor_day: number | null
          business_type: string | null
          company_address: string | null
          created_at: string
          customer_id: string | null
          date_needed: string | null
          dot_number_url: string | null
          drivers_license_back_url: string | null
          drivers_license_url: string | null
          id: string
          insurance_company: string | null
          insurance_company_phone: string | null
          insurance_docs_url: string | null
          message: string | null
          number_of_trailers: number | null
          payment_setup_sent_at: string | null
          payment_setup_status: string | null
          phone_number: string
          preferred_billing_cycle: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          secondary_contact_name: string | null
          secondary_contact_phone: string | null
          secondary_contact_relationship: string | null
          ssn: string | null
          status: string
          stripe_customer_id: string | null
          stripe_payment_method_id: string | null
          trailer_type: string | null
          truck_vin: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          billing_anchor_day?: number | null
          business_type?: string | null
          company_address?: string | null
          created_at?: string
          customer_id?: string | null
          date_needed?: string | null
          dot_number_url?: string | null
          drivers_license_back_url?: string | null
          drivers_license_url?: string | null
          id?: string
          insurance_company?: string | null
          insurance_company_phone?: string | null
          insurance_docs_url?: string | null
          message?: string | null
          number_of_trailers?: number | null
          payment_setup_sent_at?: string | null
          payment_setup_status?: string | null
          phone_number: string
          preferred_billing_cycle?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          secondary_contact_name?: string | null
          secondary_contact_phone?: string | null
          secondary_contact_relationship?: string | null
          ssn?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          trailer_type?: string | null
          truck_vin?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          billing_anchor_day?: number | null
          business_type?: string | null
          company_address?: string | null
          created_at?: string
          customer_id?: string | null
          date_needed?: string | null
          dot_number_url?: string | null
          drivers_license_back_url?: string | null
          drivers_license_url?: string | null
          id?: string
          insurance_company?: string | null
          insurance_company_phone?: string | null
          insurance_docs_url?: string | null
          message?: string | null
          number_of_trailers?: number | null
          payment_setup_sent_at?: string | null
          payment_setup_status?: string | null
          phone_number?: string
          preferred_billing_cycle?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          secondary_contact_name?: string | null
          secondary_contact_phone?: string | null
          secondary_contact_relationship?: string | null
          ssn?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_method_id?: string | null
          trailer_type?: string | null
          truck_vin?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_applications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
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
            isOneToOne: true
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
      customer_statements: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          customer_id: string
          description: string
          file_url: string | null
          id: string
          notes: string | null
          period_end: string | null
          period_start: string | null
          source: string
          statement_date: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id: string
          description: string
          file_url?: string | null
          id?: string
          notes?: string | null
          period_end?: string | null
          period_start?: string | null
          source?: string
          statement_date: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_id?: string
          description?: string
          file_url?: string | null
          id?: string
          notes?: string | null
          period_end?: string | null
          period_start?: string | null
          source?: string
          statement_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_statements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_subscriptions: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          contract_start_date: string | null
          created_at: string
          customer_id: string
          deposit_amount: number | null
          deposit_paid: boolean | null
          deposit_paid_at: string | null
          docusign_completed_at: string | null
          docusign_envelope_id: string | null
          end_date: string | null
          failed_payment_count: number | null
          grace_period_end: string | null
          grace_period_start: string | null
          id: string
          lease_agreement_url: string | null
          next_billing_date: string | null
          partner_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_type:
            | Database["public"]["Enums"]["subscription_type"]
            | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          contract_start_date?: string | null
          created_at?: string
          customer_id: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          deposit_paid_at?: string | null
          docusign_completed_at?: string | null
          docusign_envelope_id?: string | null
          end_date?: string | null
          failed_payment_count?: number | null
          grace_period_end?: string | null
          grace_period_start?: string | null
          id?: string
          lease_agreement_url?: string | null
          next_billing_date?: string | null
          partner_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_type?:
            | Database["public"]["Enums"]["subscription_type"]
            | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          contract_start_date?: string | null
          created_at?: string
          customer_id?: string
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          deposit_paid_at?: string | null
          docusign_completed_at?: string | null
          docusign_envelope_id?: string | null
          end_date?: string | null
          failed_payment_count?: number | null
          grace_period_end?: string | null
          grace_period_start?: string | null
          id?: string
          lease_agreement_url?: string | null
          next_billing_date?: string | null
          partner_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_type?:
            | Database["public"]["Enums"]["subscription_type"]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_subscriptions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
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
      development_changelog: {
        Row: {
          action: string
          category: string
          created_at: string
          date_recorded: string
          id: string
          item_name: string
          item_slug: string
          item_url: string | null
          month_year: string
          notes: string | null
        }
        Insert: {
          action: string
          category: string
          created_at?: string
          date_recorded: string
          id?: string
          item_name: string
          item_slug: string
          item_url?: string | null
          month_year: string
          notes?: string | null
        }
        Update: {
          action?: string
          category?: string
          created_at?: string
          date_recorded?: string
          id?: string
          item_name?: string
          item_slug?: string
          item_url?: string | null
          month_year?: string
          notes?: string | null
        }
        Relationships: []
      }
      discounts: {
        Row: {
          code: string | null
          created_at: string
          current_uses: number | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_trailers: number | null
          name: string
          type: Database["public"]["Enums"]["discount_type"]
          updated_at: string
          valid_from: string | null
          valid_until: string | null
          value: number
        }
        Insert: {
          code?: string | null
          created_at?: string
          current_uses?: number | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_trailers?: number | null
          name: string
          type: Database["public"]["Enums"]["discount_type"]
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          value: number
        }
        Update: {
          code?: string | null
          created_at?: string
          current_uses?: number | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_trailers?: number | null
          name?: string
          type?: Database["public"]["Enums"]["discount_type"]
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          value?: number
        }
        Relationships: []
      }
      dot_inspection_photos: {
        Row: {
          category: string
          id: string
          inspection_id: string
          photo_url: string
          uploaded_at: string | null
        }
        Insert: {
          category: string
          id?: string
          inspection_id: string
          photo_url: string
          uploaded_at?: string | null
        }
        Update: {
          category?: string
          id?: string
          inspection_id?: string
          photo_url?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dot_inspection_photos_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "dot_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      dot_inspections: {
        Row: {
          air_hoses_secure: boolean | null
          apron_intact: boolean | null
          brake_adjustment_confirmed: boolean | null
          brake_chambers_secure: boolean | null
          brake_lights_operational: boolean | null
          brakes_comments: string | null
          brakes_operational: boolean | null
          conspicuity_markings_intact: boolean | null
          coupling_comments: string | null
          crank_handle_secure: boolean | null
          created_at: string | null
          customer_acknowledged: boolean | null
          customer_acknowledged_at: string | null
          customer_certification_accepted: boolean | null
          customer_company_name: string | null
          customer_condition_accepted: boolean | null
          customer_name: string | null
          customer_responsibility_understood: boolean | null
          customer_review_confirmed: boolean | null
          customer_signature: string | null
          customer_signer_name: string | null
          doors_comments: string | null
          dot_reflective_tape_present: boolean | null
          dot_release_confirmed: boolean | null
          floor_intact: boolean | null
          frame_comments: string | null
          frame_no_cracks: boolean | null
          hinges_locks_seals_intact: boolean | null
          id: string
          inspection_date: string
          inspector_id: string
          inspector_name: string | null
          inspector_signature: string | null
          kingpin_secure: boolean | null
          landing_gear_operational: boolean | null
          license_plate: string | null
          lights_comments: string | null
          lug_nuts_secure: boolean | null
          marker_lights_operational: boolean | null
          mud_flaps_present: boolean | null
          no_air_leaks: boolean | null
          no_broken_lenses: boolean | null
          no_coupling_damage: boolean | null
          no_sharp_edges: boolean | null
          rear_doors_operational: boolean | null
          reflective_comments: string | null
          release_request_id: string | null
          rims_no_damage: boolean | null
          sidewalls_roof_intact: boolean | null
          status: string | null
          tires_comments: string | null
          tires_inflation: boolean | null
          tires_no_damage: boolean | null
          tires_tread_depth: boolean | null
          trailer_id: string
          trailer_id_visible: boolean | null
          trailer_number: string
          trailer_type: string | null
          turn_signals_operational: boolean | null
          undercarriage_secure: boolean | null
          updated_at: string | null
          vin: string | null
        }
        Insert: {
          air_hoses_secure?: boolean | null
          apron_intact?: boolean | null
          brake_adjustment_confirmed?: boolean | null
          brake_chambers_secure?: boolean | null
          brake_lights_operational?: boolean | null
          brakes_comments?: string | null
          brakes_operational?: boolean | null
          conspicuity_markings_intact?: boolean | null
          coupling_comments?: string | null
          crank_handle_secure?: boolean | null
          created_at?: string | null
          customer_acknowledged?: boolean | null
          customer_acknowledged_at?: string | null
          customer_certification_accepted?: boolean | null
          customer_company_name?: string | null
          customer_condition_accepted?: boolean | null
          customer_name?: string | null
          customer_responsibility_understood?: boolean | null
          customer_review_confirmed?: boolean | null
          customer_signature?: string | null
          customer_signer_name?: string | null
          doors_comments?: string | null
          dot_reflective_tape_present?: boolean | null
          dot_release_confirmed?: boolean | null
          floor_intact?: boolean | null
          frame_comments?: string | null
          frame_no_cracks?: boolean | null
          hinges_locks_seals_intact?: boolean | null
          id?: string
          inspection_date?: string
          inspector_id: string
          inspector_name?: string | null
          inspector_signature?: string | null
          kingpin_secure?: boolean | null
          landing_gear_operational?: boolean | null
          license_plate?: string | null
          lights_comments?: string | null
          lug_nuts_secure?: boolean | null
          marker_lights_operational?: boolean | null
          mud_flaps_present?: boolean | null
          no_air_leaks?: boolean | null
          no_broken_lenses?: boolean | null
          no_coupling_damage?: boolean | null
          no_sharp_edges?: boolean | null
          rear_doors_operational?: boolean | null
          reflective_comments?: string | null
          release_request_id?: string | null
          rims_no_damage?: boolean | null
          sidewalls_roof_intact?: boolean | null
          status?: string | null
          tires_comments?: string | null
          tires_inflation?: boolean | null
          tires_no_damage?: boolean | null
          tires_tread_depth?: boolean | null
          trailer_id: string
          trailer_id_visible?: boolean | null
          trailer_number: string
          trailer_type?: string | null
          turn_signals_operational?: boolean | null
          undercarriage_secure?: boolean | null
          updated_at?: string | null
          vin?: string | null
        }
        Update: {
          air_hoses_secure?: boolean | null
          apron_intact?: boolean | null
          brake_adjustment_confirmed?: boolean | null
          brake_chambers_secure?: boolean | null
          brake_lights_operational?: boolean | null
          brakes_comments?: string | null
          brakes_operational?: boolean | null
          conspicuity_markings_intact?: boolean | null
          coupling_comments?: string | null
          crank_handle_secure?: boolean | null
          created_at?: string | null
          customer_acknowledged?: boolean | null
          customer_acknowledged_at?: string | null
          customer_certification_accepted?: boolean | null
          customer_company_name?: string | null
          customer_condition_accepted?: boolean | null
          customer_name?: string | null
          customer_responsibility_understood?: boolean | null
          customer_review_confirmed?: boolean | null
          customer_signature?: string | null
          customer_signer_name?: string | null
          doors_comments?: string | null
          dot_reflective_tape_present?: boolean | null
          dot_release_confirmed?: boolean | null
          floor_intact?: boolean | null
          frame_comments?: string | null
          frame_no_cracks?: boolean | null
          hinges_locks_seals_intact?: boolean | null
          id?: string
          inspection_date?: string
          inspector_id?: string
          inspector_name?: string | null
          inspector_signature?: string | null
          kingpin_secure?: boolean | null
          landing_gear_operational?: boolean | null
          license_plate?: string | null
          lights_comments?: string | null
          lug_nuts_secure?: boolean | null
          marker_lights_operational?: boolean | null
          mud_flaps_present?: boolean | null
          no_air_leaks?: boolean | null
          no_broken_lenses?: boolean | null
          no_coupling_damage?: boolean | null
          no_sharp_edges?: boolean | null
          rear_doors_operational?: boolean | null
          reflective_comments?: string | null
          release_request_id?: string | null
          rims_no_damage?: boolean | null
          sidewalls_roof_intact?: boolean | null
          status?: string | null
          tires_comments?: string | null
          tires_inflation?: boolean | null
          tires_no_damage?: boolean | null
          tires_tread_depth?: boolean | null
          trailer_id?: string
          trailer_id_visible?: boolean | null
          trailer_number?: string
          trailer_type?: string | null
          turn_signals_operational?: boolean | null
          undercarriage_secure?: boolean | null
          updated_at?: string | null
          vin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dot_inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dot_inspections_release_request_id_fkey"
            columns: ["release_request_id"]
            isOneToOne: false
            referencedRelation: "trailer_release_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dot_inspections_trailer_id_fkey"
            columns: ["trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
        ]
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
      fleet_activity_logs: {
        Row: {
          action_type: string
          created_at: string
          id: string
          metadata: Json | null
          new_customer_id: string | null
          new_status: string | null
          notes: string | null
          performed_by: string
          previous_customer_id: string | null
          previous_status: string | null
          trailer_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_customer_id?: string | null
          new_status?: string | null
          notes?: string | null
          performed_by: string
          previous_customer_id?: string | null
          previous_status?: string | null
          trailer_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_customer_id?: string | null
          new_status?: string | null
          notes?: string | null
          performed_by?: string
          previous_customer_id?: string | null
          previous_status?: string | null
          trailer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_activity_logs_new_customer_id_fkey"
            columns: ["new_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleet_activity_logs_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleet_activity_logs_previous_customer_id_fkey"
            columns: ["previous_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleet_activity_logs_trailer_id_fkey"
            columns: ["trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
        ]
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
          work_order_id: string | null
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
          work_order_id?: string | null
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
          work_order_id?: string | null
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
          {
            foreignKeyName: "maintenance_records_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
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
      partner_commissions: {
        Row: {
          billing_history_id: string | null
          billing_period_end: string | null
          billing_period_start: string | null
          commission_amount: number
          commission_rate: number
          created_at: string | null
          id: string
          notes: string | null
          paid_at: string | null
          partner_id: string
          status: string
          subscription_id: string
          updated_at: string | null
        }
        Insert: {
          billing_history_id?: string | null
          billing_period_end?: string | null
          billing_period_start?: string | null
          commission_amount: number
          commission_rate: number
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          partner_id: string
          status?: string
          subscription_id: string
          updated_at?: string | null
        }
        Update: {
          billing_history_id?: string | null
          billing_period_end?: string | null
          billing_period_start?: string | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          partner_id?: string
          status?: string
          subscription_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_commissions_billing_history_id_fkey"
            columns: ["billing_history_id"]
            isOneToOne: false
            referencedRelation: "billing_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "customer_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          commission_rate: number
          company_name: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          referral_code: string
          updated_at: string | null
        }
        Insert: {
          commission_rate?: number
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          referral_code: string
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          referral_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_failures: {
        Row: {
          amount: number
          created_at: string
          failed_at: string
          failure_code: string | null
          failure_message: string | null
          id: string
          last_retry_at: string | null
          next_retry_at: string | null
          notification_sent_day_0: boolean | null
          notification_sent_day_3: boolean | null
          notification_sent_day_5: boolean | null
          resolution_type: string | null
          resolved_at: string | null
          retry_count: number | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string
          subscription_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          failed_at?: string
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          last_retry_at?: string | null
          next_retry_at?: string | null
          notification_sent_day_0?: boolean | null
          notification_sent_day_3?: boolean | null
          notification_sent_day_5?: boolean | null
          resolution_type?: string | null
          resolved_at?: string | null
          retry_count?: number | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id: string
          subscription_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          failed_at?: string
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          last_retry_at?: string | null
          next_retry_at?: string | null
          notification_sent_day_0?: boolean | null
          notification_sent_day_3?: boolean | null
          notification_sent_day_5?: boolean | null
          resolution_type?: string | null
          resolved_at?: string | null
          retry_count?: number | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_failures_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "customer_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_retry_logs: {
        Row: {
          admin_id: string
          amount: number
          created_at: string
          customer_notified: boolean | null
          error_message: string | null
          id: string
          outcome: string
          payment_failure_id: string
          stripe_invoice_id: string | null
        }
        Insert: {
          admin_id: string
          amount: number
          created_at?: string
          customer_notified?: boolean | null
          error_message?: string | null
          id?: string
          outcome: string
          payment_failure_id: string
          stripe_invoice_id?: string | null
        }
        Update: {
          admin_id?: string
          amount?: number
          created_at?: string
          customer_notified?: boolean | null
          error_message?: string | null
          id?: string
          outcome?: string
          payment_failure_id?: string
          stripe_invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_retry_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_retry_logs_payment_failure_id_fkey"
            columns: ["payment_failure_id"]
            isOneToOne: false
            referencedRelation: "payment_failures"
            referencedColumns: ["id"]
          },
        ]
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
      scheduled_content: {
        Row: {
          content_type: string
          created_at: string
          created_by: string | null
          id: string
          published_at: string | null
          scheduled_date: string
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content_type: string
          created_at?: string
          created_by?: string | null
          id?: string
          published_at?: string | null
          scheduled_date: string
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published_at?: string | null
          scheduled_date?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_content_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_catalog: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          labor_hours: number | null
          labor_price: number | null
          name: string
          parts_price: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          labor_hours?: number | null
          labor_price?: number | null
          name: string
          parts_price?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          labor_hours?: number | null
          labor_price?: number | null
          name?: string
          parts_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      stripe_webhook_logs: {
        Row: {
          amount: number | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json | null
          status: string
          stripe_subscription_id: string | null
          subscription_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          payload?: Json | null
          status?: string
          stripe_subscription_id?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json | null
          status?: string
          stripe_subscription_id?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_webhook_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_webhook_logs_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "customer_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_items: {
        Row: {
          billing_anchor_day: number | null
          billing_cycle: string | null
          created_at: string
          end_date: string | null
          id: string
          lease_to_own: boolean | null
          lease_to_own_total: number | null
          monthly_rate: number
          ownership_transfer_date: string | null
          start_date: string
          status: string
          stripe_subscription_item_id: string | null
          subscription_id: string
          trailer_id: string
          updated_at: string
        }
        Insert: {
          billing_anchor_day?: number | null
          billing_cycle?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          lease_to_own?: boolean | null
          lease_to_own_total?: number | null
          monthly_rate: number
          ownership_transfer_date?: string | null
          start_date?: string
          status?: string
          stripe_subscription_item_id?: string | null
          subscription_id: string
          trailer_id: string
          updated_at?: string
        }
        Update: {
          billing_anchor_day?: number | null
          billing_cycle?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          lease_to_own?: boolean | null
          lease_to_own_total?: number | null
          monthly_rate?: number
          ownership_transfer_date?: string | null
          start_date?: string
          status?: string
          stripe_subscription_item_id?: string | null
          subscription_id?: string
          trailer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_items_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "customer_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_items_trailer_id_fkey"
            columns: ["trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
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
          last_reminder_sent_at: string | null
          notes: string | null
          payment_date: string | null
          receipt_url: string | null
          reminder_count: number | null
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
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
          last_reminder_sent_at?: string | null
          notes?: string | null
          payment_date?: string | null
          receipt_url?: string | null
          reminder_count?: number | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
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
          last_reminder_sent_at?: string | null
          notes?: string | null
          payment_date?: string | null
          receipt_url?: string | null
          reminder_count?: number | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
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
      trailer_checkout_agreements: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string
          customer_id: string
          final_release_document_url: string | null
          final_release_signed: boolean | null
          final_release_signed_at: string | null
          final_release_signer_ip: string | null
          final_release_signer_name: string | null
          id: string
          id_verification_notes: string | null
          id_verified: boolean | null
          id_verified_at: string | null
          id_verified_by: string | null
          pre_pickup_document_url: string | null
          pre_pickup_signed: boolean | null
          pre_pickup_signed_at: string | null
          pre_pickup_signer_ip: string | null
          pre_pickup_signer_name: string | null
          release_request_id: string | null
          status: string
          trailer_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          customer_id: string
          final_release_document_url?: string | null
          final_release_signed?: boolean | null
          final_release_signed_at?: string | null
          final_release_signer_ip?: string | null
          final_release_signer_name?: string | null
          id?: string
          id_verification_notes?: string | null
          id_verified?: boolean | null
          id_verified_at?: string | null
          id_verified_by?: string | null
          pre_pickup_document_url?: string | null
          pre_pickup_signed?: boolean | null
          pre_pickup_signed_at?: string | null
          pre_pickup_signer_ip?: string | null
          pre_pickup_signer_name?: string | null
          release_request_id?: string | null
          status?: string
          trailer_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          customer_id?: string
          final_release_document_url?: string | null
          final_release_signed?: boolean | null
          final_release_signed_at?: string | null
          final_release_signer_ip?: string | null
          final_release_signer_name?: string | null
          id?: string
          id_verification_notes?: string | null
          id_verified?: boolean | null
          id_verified_at?: string | null
          id_verified_by?: string | null
          pre_pickup_document_url?: string | null
          pre_pickup_signed?: boolean | null
          pre_pickup_signed_at?: string | null
          pre_pickup_signer_ip?: string | null
          pre_pickup_signer_name?: string | null
          release_request_id?: string | null
          status?: string
          trailer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trailer_checkout_agreements_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trailer_checkout_agreements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trailer_checkout_agreements_id_verified_by_fkey"
            columns: ["id_verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trailer_checkout_agreements_release_request_id_fkey"
            columns: ["release_request_id"]
            isOneToOne: false
            referencedRelation: "trailer_release_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trailer_checkout_agreements_trailer_id_fkey"
            columns: ["trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
        ]
      }
      trailer_dropoff_requests: {
        Row: {
          created_at: string
          customer_company: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          notes: string | null
          received_at: string | null
          received_by: string | null
          scheduled_by: string
          scheduled_dropoff_date: string
          status: string
          trailer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_company?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          received_at?: string | null
          received_by?: string | null
          scheduled_by: string
          scheduled_dropoff_date: string
          status?: string
          trailer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_company?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          notes?: string | null
          received_at?: string | null
          received_by?: string | null
          scheduled_by?: string
          scheduled_dropoff_date?: string
          status?: string
          trailer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trailer_dropoff_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trailer_dropoff_requests_trailer_id_fkey"
            columns: ["trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
        ]
      }
      trailer_release_requests: {
        Row: {
          assigned_mechanic_id: string | null
          created_at: string
          customer_company: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          dot_inspection_id: string | null
          id: string
          notes: string | null
          requested_by: string
          scheduled_pickup_date: string
          status: string
          trailer_id: string
          updated_at: string
        }
        Insert: {
          assigned_mechanic_id?: string | null
          created_at?: string
          customer_company?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          dot_inspection_id?: string | null
          id?: string
          notes?: string | null
          requested_by: string
          scheduled_pickup_date: string
          status?: string
          trailer_id: string
          updated_at?: string
        }
        Update: {
          assigned_mechanic_id?: string | null
          created_at?: string
          customer_company?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          dot_inspection_id?: string | null
          id?: string
          notes?: string | null
          requested_by?: string
          scheduled_pickup_date?: string
          status?: string
          trailer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trailer_release_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trailer_release_requests_dot_inspection_id_fkey"
            columns: ["dot_inspection_id"]
            isOneToOne: false
            referencedRelation: "dot_inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trailer_release_requests_trailer_id_fkey"
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
          axle_count: number | null
          body_material: string | null
          company_id: string
          created_at: string
          crossmember_spacing: string | null
          customer_id: string | null
          door_type: string | null
          empty_weight: number | null
          floor_thickness: string | null
          gps_box_number: string | null
          gps_latitude: number | null
          gps_longitude: number | null
          has_side_skirts: boolean | null
          id: string
          inside_width: string | null
          is_rented: boolean | null
          last_location_update: string | null
          last_pm_date: string | null
          license_plate: string | null
          make: string | null
          model: string | null
          notes: string | null
          purchase_price: number | null
          rental_frequency: string | null
          rental_income: number | null
          rental_rate: number | null
          roof_type: string | null
          side_post_spacing: string | null
          side_skirt_type: string | null
          status: string
          suspension_type: string | null
          tire_tread_condition: string | null
          tire_type: string | null
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
          axle_count?: number | null
          body_material?: string | null
          company_id: string
          created_at?: string
          crossmember_spacing?: string | null
          customer_id?: string | null
          door_type?: string | null
          empty_weight?: number | null
          floor_thickness?: string | null
          gps_box_number?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          has_side_skirts?: boolean | null
          id?: string
          inside_width?: string | null
          is_rented?: boolean | null
          last_location_update?: string | null
          last_pm_date?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          notes?: string | null
          purchase_price?: number | null
          rental_frequency?: string | null
          rental_income?: number | null
          rental_rate?: number | null
          roof_type?: string | null
          side_post_spacing?: string | null
          side_skirt_type?: string | null
          status?: string
          suspension_type?: string | null
          tire_tread_condition?: string | null
          tire_type?: string | null
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
          axle_count?: number | null
          body_material?: string | null
          company_id?: string
          created_at?: string
          crossmember_spacing?: string | null
          customer_id?: string | null
          door_type?: string | null
          empty_weight?: number | null
          floor_thickness?: string | null
          gps_box_number?: string | null
          gps_latitude?: number | null
          gps_longitude?: number | null
          has_side_skirts?: boolean | null
          id?: string
          inside_width?: string | null
          is_rented?: boolean | null
          last_location_update?: string | null
          last_pm_date?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          notes?: string | null
          purchase_price?: number | null
          rental_frequency?: string | null
          rental_income?: number | null
          rental_rate?: number | null
          roof_type?: string | null
          side_post_spacing?: string | null
          side_skirt_type?: string | null
          status?: string
          suspension_type?: string | null
          tire_tread_condition?: string | null
          tire_type?: string | null
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
      user_activity_logs: {
        Row: {
          created_at: string
          email: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          role: string | null
          session_duration_seconds: number | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          role?: string | null
          session_duration_seconds?: number | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          role?: string | null
          session_duration_seconds?: number | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
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
      work_order_line_items: {
        Row: {
          created_at: string
          description: string
          id: string
          item_type: string
          line_total: number | null
          quantity: number
          unit_cost: number
          work_order_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          item_type?: string
          line_total?: number | null
          quantity?: number
          unit_cost?: number
          work_order_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          item_type?: string
          line_total?: number | null
          quantity?: number
          unit_cost?: number
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_line_items_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string
          grand_total: number
          id: string
          invoice_document_url: string | null
          labor_hours: number
          labor_rate: number
          labor_total: number | null
          mechanic_id: string
          parts_total: number
          photo_urls: Json | null
          repair_type: string
          status: string
          submitted_at: string | null
          trailer_id: string
          travel_fee: number
          updated_at: string
          work_completion_date: string | null
          work_start_date: string
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description: string
          grand_total?: number
          id?: string
          invoice_document_url?: string | null
          labor_hours?: number
          labor_rate?: number
          labor_total?: number | null
          mechanic_id: string
          parts_total?: number
          photo_urls?: Json | null
          repair_type: string
          status?: string
          submitted_at?: string | null
          trailer_id: string
          travel_fee?: number
          updated_at?: string
          work_completion_date?: string | null
          work_start_date: string
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string
          grand_total?: number
          id?: string
          invoice_document_url?: string | null
          labor_hours?: number
          labor_rate?: number
          labor_total?: number | null
          mechanic_id?: string
          parts_total?: number
          photo_urls?: Json | null
          repair_type?: string
          status?: string
          submitted_at?: string | null
          trailer_id?: string
          travel_fee?: number
          updated_at?: string
          work_completion_date?: string | null
          work_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_trailer_id_fkey"
            columns: ["trailer_id"]
            isOneToOne: false
            referencedRelation: "trailers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      customer_application_safe: {
        Row: {
          admin_notes: string | null
          business_type: string | null
          company_address: string | null
          created_at: string | null
          date_needed: string | null
          has_dot_document: boolean | null
          has_drivers_license: boolean | null
          has_drivers_license_back: boolean | null
          has_insurance_docs: boolean | null
          id: string | null
          insurance_company: string | null
          insurance_company_phone: string | null
          message: string | null
          number_of_trailers: number | null
          phone_number: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          secondary_contact_name: string | null
          secondary_contact_phone: string | null
          secondary_contact_relationship: string | null
          ssn_masked: string | null
          status: string | null
          trailer_type: string | null
          truck_vin: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          business_type?: string | null
          company_address?: string | null
          created_at?: string | null
          date_needed?: string | null
          has_dot_document?: never
          has_drivers_license?: never
          has_drivers_license_back?: never
          has_insurance_docs?: never
          id?: string | null
          insurance_company?: string | null
          insurance_company_phone?: string | null
          message?: string | null
          number_of_trailers?: number | null
          phone_number?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          secondary_contact_name?: string | null
          secondary_contact_phone?: string | null
          secondary_contact_relationship?: string | null
          ssn_masked?: never
          status?: string | null
          trailer_type?: string | null
          truck_vin?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          business_type?: string | null
          company_address?: string | null
          created_at?: string | null
          date_needed?: string | null
          has_dot_document?: never
          has_drivers_license?: never
          has_drivers_license_back?: never
          has_insurance_docs?: never
          id?: string | null
          insurance_company?: string | null
          insurance_company_phone?: string | null
          message?: string | null
          number_of_trailers?: number | null
          phone_number?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          secondary_contact_name?: string | null
          secondary_contact_phone?: string | null
          secondary_contact_relationship?: string | null
          ssn_masked?: never
          status?: string | null
          trailer_type?: string | null
          truck_vin?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
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
            isOneToOne: true
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
      get_cron_history: {
        Args: { limit_count?: number }
        Returns: {
          end_time: string
          jobid: number
          jobname: string
          return_message: string
          runid: number
          start_time: string
          status: string
        }[]
      }
      get_cron_jobs: {
        Args: never
        Returns: {
          active: boolean
          jobid: number
          jobname: string
          schedule: string
        }[]
      }
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
      billing_cycle: "weekly" | "biweekly" | "monthly" | "semimonthly"
      discount_type: "percentage" | "fixed" | "multi_trailer" | "promo_code"
      payment_status:
        | "pending"
        | "processing"
        | "succeeded"
        | "failed"
        | "refunded"
      subscription_type:
        | "standard_lease"
        | "rent_for_storage"
        | "lease_to_own"
        | "repayment_plan"
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
      billing_cycle: ["weekly", "biweekly", "monthly", "semimonthly"],
      discount_type: ["percentage", "fixed", "multi_trailer", "promo_code"],
      payment_status: [
        "pending",
        "processing",
        "succeeded",
        "failed",
        "refunded",
      ],
      subscription_type: [
        "standard_lease",
        "rent_for_storage",
        "lease_to_own",
        "repayment_plan",
      ],
    },
  },
} as const
