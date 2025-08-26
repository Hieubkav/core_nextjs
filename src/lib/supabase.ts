import { createClient } from '@supabase/supabase-js'

// Database type definitions - Comprehensive schema
export interface Database {
  public: {
    Tables: {
      // Users table
      users: {
        Row: {
          id: string;
          email: string;
          password_hash?: string;
          full_name?: string;
          avatar_url?: string;
          phone?: string;
          role: 'admin' | 'user';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash?: string;
          full_name?: string;
          avatar_url?: string;
          phone?: string;
          role?: 'admin' | 'user';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          full_name?: string;
          avatar_url?: string;
          phone?: string;
          role?: 'admin' | 'user';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      // Products table
      products: {
        Row: {
          id: string;
          name: string;
          description?: string;
          price: number;
          category_id?: string;
          image_url?: string;
          images?: string[];
          stock_quantity: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          price: number;
          category_id?: string;
          image_url?: string;
          images?: string[];
          stock_quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          category_id?: string;
          image_url?: string;
          images?: string[];
          stock_quantity?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      // Categories table
      categories: {
        Row: {
          id: string;
          name: string;
          description?: string;
          image_url?: string;
          parent_id?: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          image_url?: string;
          parent_id?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          image_url?: string;
          parent_id?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      // Orders table
      orders: {
        Row: {
          id: string;
          user_id: string;
          total_amount: number;
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          shipping_address?: string;
          payment_method?: string;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_amount: number;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          shipping_address?: string;
          payment_method?: string;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_amount?: number;
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
          shipping_address?: string;
          payment_method?: string;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      
      // Order Items table
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      
      // Settings table
      settings: {
        Row: {
          id: string;
          site_name?: string;
          site_description?: string;
          contact_email?: string;
          contact_phone?: string;
          contact_address?: string;
          social_facebook?: string;
          social_instagram?: string;
          social_twitter?: string;
          logo_url?: string;
          favicon_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          site_name?: string;
          site_description?: string;
          contact_email?: string;
          contact_phone?: string;
          contact_address?: string;
          social_facebook?: string;
          social_instagram?: string;
          social_twitter?: string;
          logo_url?: string;
          favicon_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          site_name?: string;
          site_description?: string;
          contact_email?: string;
          contact_phone?: string;
          contact_address?: string;
          social_facebook?: string;
          social_instagram?: string;
          social_twitter?: string;
          logo_url?: string;
          favicon_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Safe environment variable access with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client with comprehensive error handling
export const supabase = (() => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase environment variables not found. Using placeholder client for development.');
      // Return a mock client for development/static generation
      return createClient('https://placeholder.supabase.co', 'placeholder-key');
    }
    
    console.log('✅ Supabase client initialized successfully');
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    // Return a mock client as fallback
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
})();

// Export types for use in other files
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Common type aliases
export type User = Tables<'users'>;
export type Product = Tables<'products'>;
export type Category = Tables<'categories'>;
export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type Settings = Tables<'settings'>;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key');
};

// Helper function to get error message from Supabase error
export const getSupabaseErrorMessage = (error: any): string => {
  if (error?.message) return error.message;
  if (error?.error_description) return error.error_description;
  if (typeof error === 'string') return error;
  return 'Đã xảy ra lỗi không xác định';
};
