/**
 * Supabase Database Types
 *
 * This is a placeholder type definition. It will be replaced with
 * auto-generated types from Supabase CLI once the database schema is complete.
 *
 * To generate types:
 * npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          company_name: string | null;
          avatar_url: string | null;
          role: Database['public']['Enums']['user_role'];
          approval_status: Database['public']['Enums']['approval_status'];
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          company_name?: string | null;
          avatar_url?: string | null;
          role?: Database['public']['Enums']['user_role'];
          approval_status?: Database['public']['Enums']['approval_status'];
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          company_name?: string | null;
          avatar_url?: string | null;
          role?: Database['public']['Enums']['user_role'];
          approval_status?: Database['public']['Enums']['approval_status'];
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      expert_profiles: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          business_registration_number: string | null;
          category: Database['public']['Enums']['expert_category'];
          subcategories: string[];
          service_description: string | null;
          specialty: string[];
          price_range_min: number | null;
          price_range_max: number | null;
          service_regions: string[];
          portfolio_url: string | null;
          portfolio_files: string[];
          status: Database['public']['Enums']['expert_status'];
          verification_documents: string[];
          verified_at: string | null;
          verified_by: string | null;
          rejection_reason: string | null;
          is_featured: boolean;
          is_available: boolean;
          view_count: number;
          contact_count: number;
          created_at: string;
          updated_at: string;
          submitted_at: string | null;
          collaboration_needs: string | null;
          bio: string | null;
          experience_years: number | null;
          hourly_rate: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          business_registration_number?: string | null;
          category: Database['public']['Enums']['expert_category'];
          subcategories?: string[];
          service_description?: string | null;
          specialty?: string[];
          price_range_min?: number | null;
          price_range_max?: number | null;
          service_regions?: string[];
          portfolio_url?: string | null;
          portfolio_files?: string[];
          status?: Database['public']['Enums']['expert_status'];
          verification_documents?: string[];
          verified_at?: string | null;
          verified_by?: string | null;
          rejection_reason?: string | null;
          is_featured?: boolean;
          is_available?: boolean;
          view_count?: number;
          contact_count?: number;
          created_at?: string;
          updated_at?: string;
          submitted_at?: string | null;
          collaboration_needs?: string | null;
          bio?: string | null;
          experience_years?: number | null;
          hourly_rate?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          business_registration_number?: string | null;
          category?: Database['public']['Enums']['expert_category'];
          subcategories?: string[];
          service_description?: string | null;
          specialty?: string[];
          price_range_min?: number | null;
          price_range_max?: number | null;
          service_regions?: string[];
          portfolio_url?: string | null;
          portfolio_files?: string[];
          status?: Database['public']['Enums']['expert_status'];
          verification_documents?: string[];
          verified_at?: string | null;
          verified_by?: string | null;
          rejection_reason?: string | null;
          is_featured?: boolean;
          is_available?: boolean;
          view_count?: number;
          contact_count?: number;
          created_at?: string;
          updated_at?: string;
          submitted_at?: string | null;
          collaboration_needs?: string | null;
          bio?: string | null;
          experience_years?: number | null;
          hourly_rate?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'expert_profiles_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'expert_profiles_verified_by_fkey';
            columns: ['verified_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      posts: {
        Row: {
          id: number;
          author_id: string;
          content: string;
          media_urls: string[];
          like_count: number;
          comment_count: number;
          is_pinned: boolean;
          is_hidden: boolean;
          hidden_reason: string | null;
          hidden_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          author_id: string;
          content: string;
          media_urls?: string[];
          like_count?: number;
          comment_count?: number;
          is_pinned?: boolean;
          is_hidden?: boolean;
          hidden_reason?: string | null;
          hidden_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          author_id?: string;
          content?: string;
          media_urls?: string[];
          like_count?: number;
          comment_count?: number;
          is_pinned?: boolean;
          is_hidden?: boolean;
          hidden_reason?: string | null;
          hidden_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_author_id_fkey';
            columns: ['author_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_hidden_by_fkey';
            columns: ['hidden_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      comments: {
        Row: {
          id: number;
          post_id: number;
          author_id: string;
          parent_id: number | null;
          content: string;
          like_count: number;
          is_hidden: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          post_id: number;
          author_id: string;
          parent_id?: number | null;
          content: string;
          like_count?: number;
          is_hidden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          post_id?: number;
          author_id?: string;
          parent_id?: number | null;
          content?: string;
          like_count?: number;
          is_hidden?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_post_id_fkey';
            columns: ['post_id'];
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_author_id_fkey';
            columns: ['author_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_parent_id_fkey';
            columns: ['parent_id'];
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          }
        ];
      };
      likes: {
        Row: {
          id: number;
          user_id: string;
          likeable_type: Database['public']['Enums']['likeable_type'];
          likeable_id: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          likeable_type: Database['public']['Enums']['likeable_type'];
          likeable_id: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          likeable_type?: Database['public']['Enums']['likeable_type'];
          likeable_id?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'likes_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      collaboration_requests: {
        Row: {
          id: number;
          sender_id: string;
          recipient_id: string;
          expert_profile_id: string | null;
          type: Database['public']['Enums']['collaboration_type'];
          subject: string;
          message: string;
          contact_info: string | null;
          status: Database['public']['Enums']['collaboration_status'];
          response_message: string | null;
          responded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          sender_id: string;
          recipient_id: string;
          expert_profile_id?: string | null;
          type: Database['public']['Enums']['collaboration_type'];
          subject: string;
          message: string;
          contact_info?: string | null;
          status?: Database['public']['Enums']['collaboration_status'];
          response_message?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          sender_id?: string;
          recipient_id?: string;
          expert_profile_id?: string | null;
          type?: Database['public']['Enums']['collaboration_type'];
          subject?: string;
          message?: string;
          contact_info?: string | null;
          status?: Database['public']['Enums']['collaboration_status'];
          response_message?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'collaboration_requests_sender_id_fkey';
            columns: ['sender_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'collaboration_requests_recipient_id_fkey';
            columns: ['recipient_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'collaboration_requests_expert_profile_id_fkey';
            columns: ['expert_profile_id'];
            referencedRelation: 'expert_profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      support_programs: {
        Row: {
          id: number;
          title: string;
          description: string;
          organization: string;
          category: Database['public']['Enums']['program_category'];
          amount: string | null;
          eligibility: string | null;
          benefits: string[];
          external_url: string | null;
          image_url: string | null;
          application_start: string | null;
          application_deadline: string | null;
          program_start: string | null;
          program_end: string | null;
          status: Database['public']['Enums']['program_status'];
          created_by: string;
          view_count: number;
          bookmark_count: number;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: number;
          title: string;
          description: string;
          organization: string;
          category: Database['public']['Enums']['program_category'];
          amount?: string | null;
          eligibility?: string | null;
          benefits?: string[];
          external_url?: string | null;
          image_url?: string | null;
          application_start?: string | null;
          application_deadline?: string | null;
          program_start?: string | null;
          program_end?: string | null;
          status?: Database['public']['Enums']['program_status'];
          created_by: string;
          view_count?: number;
          bookmark_count?: number;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: number;
          title?: string;
          description?: string;
          organization?: string;
          category?: Database['public']['Enums']['program_category'];
          amount?: string | null;
          eligibility?: string | null;
          benefits?: string[];
          external_url?: string | null;
          image_url?: string | null;
          application_start?: string | null;
          application_deadline?: string | null;
          program_start?: string | null;
          program_end?: string | null;
          status?: Database['public']['Enums']['program_status'];
          created_by?: string;
          view_count?: number;
          bookmark_count?: number;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'support_programs_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      bookmarks: {
        Row: {
          id: number;
          user_id: string;
          bookmarkable_type: Database['public']['Enums']['bookmarkable_type'];
          bookmarkable_id: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          bookmarkable_type: Database['public']['Enums']['bookmarkable_type'];
          bookmarkable_id: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          bookmarkable_type?: Database['public']['Enums']['bookmarkable_type'];
          bookmarkable_id?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookmarks_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      notifications: {
        Row: {
          id: number;
          user_id: string;
          type: Database['public']['Enums']['notification_type'];
          title: string;
          body: string | null;
          reference_type: string | null;
          reference_id: string | null;
          metadata: Json;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          type: Database['public']['Enums']['notification_type'];
          title: string;
          body?: string | null;
          reference_type?: string | null;
          reference_id?: string | null;
          metadata?: Json;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          type?: Database['public']['Enums']['notification_type'];
          title?: string;
          body?: string | null;
          reference_type?: string | null;
          reference_id?: string | null;
          metadata?: Json;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'member' | 'expert' | 'admin';
      approval_status: 'pending' | 'approved' | 'rejected' | 'suspended';
      likeable_type: 'post' | 'comment';
      expert_status: 'draft' | 'pending_review' | 'approved' | 'rejected';
      expert_category:
        | 'marketing'
        | 'development'
        | 'design'
        | 'legal'
        | 'finance'
        | 'hr'
        | 'operations'
        | 'strategy'
        | 'other';
      collaboration_type: 'coffee_chat' | 'collaboration';
      collaboration_status: 'pending' | 'accepted' | 'declined' | 'cancelled';
      program_status: 'draft' | 'published' | 'archived';
      program_category:
        | 'funding'
        | 'mentoring'
        | 'education'
        | 'networking'
        | 'space'
        | 'other';
      bookmarkable_type: 'expert_profile' | 'support_program' | 'post';
      notification_type:
        | 'member_approved'
        | 'member_rejected'
        | 'expert_approved'
        | 'expert_rejected'
        | 'new_comment'
        | 'new_like'
        | 'new_collaboration_request'
        | 'collaboration_accepted'
        | 'collaboration_declined'
        | 'system_announcement';
    };
    CompositeTypes: Record<string, never>;
  };
}
