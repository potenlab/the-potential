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
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'member' | 'expert' | 'admin';
      approval_status: 'pending' | 'approved' | 'rejected' | 'suspended';
    };
    CompositeTypes: Record<string, never>;
  };
}
