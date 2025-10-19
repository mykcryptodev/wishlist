/**
 * Supabase Client Configuration
 *
 * This module provides both browser and server-side Supabase clients
 * for managing gift exchange data.
 */

import { createClient } from "@supabase/supabase-js";

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

/**
 * Browser-side Supabase client (uses anon key)
 * Safe to use in client components
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase client with service role (admin access)
 * Only use in API routes or server components
 * DO NOT expose this client to the browser
 */
if (!supabaseServiceRoleKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. This is required for server-side operations.",
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Type definitions for our database schema
export interface Exchange {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  invite_code: string;
}

export interface ExchangeMembership {
  id: string;
  exchange_id: string;
  wallet_address: string;
  joined_at: string;
}

export type Database = {
  public: {
    Tables: {
      exchanges: {
        Row: Exchange;
        Insert: Omit<Exchange, "id" | "created_at">;
        Update: Partial<Omit<Exchange, "id" | "created_at">>;
      };
      exchange_memberships: {
        Row: ExchangeMembership;
        Insert: Omit<ExchangeMembership, "id" | "joined_at">;
        Update: Partial<Omit<ExchangeMembership, "id" | "joined_at">>;
      };
    };
  };
};
