'use client';

import { useState, useCallback } from 'react';
import { supabase, Database, getSupabaseErrorMessage } from '@/lib/supabase';
import { useToast } from './useToast';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

// Generic CRUD hook for Supabase tables
export function useCrud<T extends TableName>(tableName: T) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Tables[T]['Row'][]>([]);
  const { success, error } = useToast();

  type Row = Tables[T]['Row'];
  type Insert = Tables[T]['Insert'];
  type Update = Tables[T]['Update'];

  // Create operation
  const create = useCallback(async (
    insertData: Insert,
    options?: {
      showToast?: boolean;
      successMessage?: string;
      errorMessage?: string;
    }
  ): Promise<Row | null> => {
    try {
      setLoading(true);
      
      const { data: result, error: createError } = await supabase
        .from(tableName)
        .insert([insertData])
        .select()
        .single();

      if (createError) {
        const errorMsg = getSupabaseErrorMessage(createError);
        console.error(`❌ Error creating ${tableName}:`, createError);
        
        if (options?.showToast !== false) {
          error(
            options?.errorMessage || `Lỗi tạo ${tableName}`,
            errorMsg
          );
        }
        return null;
      }

      if (options?.showToast !== false) {
        success(options?.successMessage || `Tạo ${tableName} thành công!`);
      }

      // Update local data if we have it
      setData(prev => [result, ...prev]);
      
      return result;
    } catch (err) {
      const errorMsg = getSupabaseErrorMessage(err);
      console.error(`❌ Unexpected error creating ${tableName}:`, err);
      
      if (options?.showToast !== false) {
        error(
          options?.errorMessage || `Lỗi tạo ${tableName}`,
          errorMsg
        );
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [tableName, success, error]);

  // Read operation (fetch all)
  const fetchAll = useCallback(async (
    options?: {
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      filters?: Record<string, any>;
      showToast?: boolean;
    }
  ): Promise<Row[]> => {
    try {
      setLoading(true);
      
      let query = supabase.from(tableName).select('*');
      
      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? false 
        });
      }
      
      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: result, error: fetchError } = await query;

      if (fetchError) {
        const errorMsg = getSupabaseErrorMessage(fetchError);
        console.error(`❌ Error fetching ${tableName}:`, fetchError);
        
        if (options?.showToast !== false) {
          error(`Lỗi tải ${tableName}`, errorMsg);
        }
        return [];
      }

      setData(result || []);
      return result || [];
    } catch (err) {
      const errorMsg = getSupabaseErrorMessage(err);
      console.error(`❌ Unexpected error fetching ${tableName}:`, err);
      
      if (options?.showToast !== false) {
        error(`Lỗi tải ${tableName}`, errorMsg);
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [tableName, error]);

  // Read operation (fetch by ID)
  const fetchById = useCallback(async (
    id: string,
    options?: { showToast?: boolean }
  ): Promise<Row | null> => {
    try {
      setLoading(true);
      
      const { data: result, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        const errorMsg = getSupabaseErrorMessage(fetchError);
        console.error(`❌ Error fetching ${tableName} by ID:`, fetchError);
        
        if (options?.showToast !== false) {
          error(`Lỗi tải ${tableName}`, errorMsg);
        }
        return null;
      }

      return result;
    } catch (err) {
      const errorMsg = getSupabaseErrorMessage(err);
      console.error(`❌ Unexpected error fetching ${tableName} by ID:`, err);
      
      if (options?.showToast !== false) {
        error(`Lỗi tải ${tableName}`, errorMsg);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [tableName, error]);

  // Update operation
  const update = useCallback(async (
    id: string,
    updateData: Update,
    options?: {
      showToast?: boolean;
      successMessage?: string;
      errorMessage?: string;
    }
  ): Promise<Row | null> => {
    try {
      setLoading(true);
      
      const { data: result, error: updateError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        const errorMsg = getSupabaseErrorMessage(updateError);
        console.error(`❌ Error updating ${tableName}:`, updateError);
        
        if (options?.showToast !== false) {
          error(
            options?.errorMessage || `Lỗi cập nhật ${tableName}`,
            errorMsg
          );
        }
        return null;
      }

      if (options?.showToast !== false) {
        success(options?.successMessage || `Cập nhật ${tableName} thành công!`);
      }

      // Update local data if we have it
      setData(prev => prev.map(item => 
        (item as any).id === id ? result : item
      ));
      
      return result;
    } catch (err) {
      const errorMsg = getSupabaseErrorMessage(err);
      console.error(`❌ Unexpected error updating ${tableName}:`, err);
      
      if (options?.showToast !== false) {
        error(
          options?.errorMessage || `Lỗi cập nhật ${tableName}`,
          errorMsg
        );
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [tableName, success, error]);

  // Delete operation
  const remove = useCallback(async (
    id: string,
    options?: {
      showToast?: boolean;
      successMessage?: string;
      errorMessage?: string;
    }
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (deleteError) {
        const errorMsg = getSupabaseErrorMessage(deleteError);
        console.error(`❌ Error deleting ${tableName}:`, deleteError);
        
        if (options?.showToast !== false) {
          error(
            options?.errorMessage || `Lỗi xóa ${tableName}`,
            errorMsg
          );
        }
        return false;
      }

      if (options?.showToast !== false) {
        success(options?.successMessage || `Xóa ${tableName} thành công!`);
      }

      // Update local data if we have it
      setData(prev => prev.filter(item => (item as any).id !== id));
      
      return true;
    } catch (err) {
      const errorMsg = getSupabaseErrorMessage(err);
      console.error(`❌ Unexpected error deleting ${tableName}:`, err);
      
      if (options?.showToast !== false) {
        error(
          options?.errorMessage || `Lỗi xóa ${tableName}`,
          errorMsg
        );
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [tableName, success, error]);

  // Bulk operations
  const bulkCreate = useCallback(async (
    insertDataArray: Insert[],
    options?: { showToast?: boolean }
  ): Promise<Row[]> => {
    try {
      setLoading(true);
      
      const { data: result, error: createError } = await supabase
        .from(tableName)
        .insert(insertDataArray)
        .select();

      if (createError) {
        const errorMsg = getSupabaseErrorMessage(createError);
        console.error(`❌ Error bulk creating ${tableName}:`, createError);
        
        if (options?.showToast !== false) {
          error(`Lỗi tạo nhiều ${tableName}`, errorMsg);
        }
        return [];
      }

      if (options?.showToast !== false) {
        success(`Tạo ${result?.length || 0} ${tableName} thành công!`);
      }

      // Update local data if we have it
      setData(prev => [...(result || []), ...prev]);
      
      return result || [];
    } catch (err) {
      const errorMsg = getSupabaseErrorMessage(err);
      console.error(`❌ Unexpected error bulk creating ${tableName}:`, err);
      
      if (options?.showToast !== false) {
        error(`Lỗi tạo nhiều ${tableName}`, errorMsg);
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, [tableName, success, error]);

  return {
    // Data
    data,
    loading,

    // CRUD operations
    create,
    fetchAll,
    fetchById,
    update,
    remove,
    bulkCreate,

    // Utilities
    setData,
    refresh: fetchAll,
  };
}

// Utility function to generate short IDs
export const generateShortId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
