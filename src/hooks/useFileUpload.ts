'use client';

import { useState, useCallback } from 'react';
import { supabase, getSupabaseErrorMessage } from '@/lib/supabase';
import { useToast } from './useToast';

export interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSizeInMB?: number;
  allowedTypes?: string[];
  generateFileName?: boolean;
}

export interface UploadResult {
  url: string;
  path: string;
  fullPath: string;
}

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { success, error } = useToast();

  // Create bucket if it doesn't exist
  const createBucket = useCallback(async (bucketName: string, isPublic: boolean = true) => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: isPublic,
          allowedMimeTypes: ['image/*', 'video/*', 'application/pdf'],
          fileSizeLimit: 10 * 1024 * 1024, // 10MB
        });
        
        if (createError) {
          console.error('❌ Error creating bucket:', createError);
          return false;
        }
        
        console.log(`✅ Bucket '${bucketName}' created successfully`);
      }
      
      return true;
    } catch (err) {
      console.error('❌ Error checking/creating bucket:', err);
      return false;
    }
  }, []);

  // Upload single file
  const uploadFile = useCallback(async (
    file: File,
    options: UploadOptions
  ): Promise<UploadResult | null> => {
    try {
      setUploading(true);
      setProgress(0);

      // Validate file size
      const maxSize = (options.maxSizeInMB || 5) * 1024 * 1024; // Default 5MB
      if (file.size > maxSize) {
        error('Lỗi upload', `File quá lớn. Tối đa ${options.maxSizeInMB || 5}MB`);
        return null;
      }

      // Validate file type
      const allowedTypes = options.allowedTypes || [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm',
        'application/pdf'
      ];
      if (!allowedTypes.includes(file.type)) {
        error('Lỗi upload', 'Định dạng file không được hỗ trợ');
        return null;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = options.generateFileName !== false 
        ? `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        : file.name;
      
      const folder = options.folder || 'uploads';
      const filePath = `${folder}/${fileName}`;

      console.log('🔄 Uploading file:', { fileName, filePath, size: file.size, type: file.type });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Ensure bucket exists
      await createBucket(options.bucket);

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);
      setProgress(100);

      if (uploadError) {
        const errorMsg = getSupabaseErrorMessage(uploadError);
        console.error('❌ Upload error:', uploadError);
        error('Lỗi upload', errorMsg);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(filePath);

      const result: UploadResult = {
        url: urlData.publicUrl,
        path: filePath,
        fullPath: data.path,
      };

      console.log('✅ Upload successful:', result);
      success(`Upload ${file.name} thành công!`);
      
      return result;
    } catch (err) {
      const errorMsg = getSupabaseErrorMessage(err);
      console.error('❌ Upload error:', err);
      error('Lỗi upload', errorMsg);
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [createBucket, success, error]);

  // Upload multiple files
  const uploadFiles = useCallback(async (
    files: File[],
    options: UploadOptions
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      const result = await uploadFile(file, options);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  }, [uploadFile]);

  // Delete file
  const deleteFile = useCallback(async (
    bucket: string,
    filePath: string,
    showToast: boolean = true
  ): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (deleteError) {
        const errorMsg = getSupabaseErrorMessage(deleteError);
        console.error('❌ Delete error:', deleteError);
        if (showToast) {
          error('Lỗi xóa file', errorMsg);
        }
        return false;
      }

      console.log('✅ File deleted successfully:', filePath);
      if (showToast) {
        success('Xóa file thành công!');
      }
      
      return true;
    } catch (err) {
      const errorMsg = getSupabaseErrorMessage(err);
      console.error('❌ Delete error:', err);
      if (showToast) {
        error('Lỗi xóa file', errorMsg);
      }
      return false;
    }
  }, [success, error]);

  // Get file URL
  const getFileUrl = useCallback((bucket: string, filePath: string): string => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }, []);

  // List files in bucket/folder
  const listFiles = useCallback(async (
    bucket: string,
    folder?: string,
    options?: {
      limit?: number;
      offset?: number;
      sortBy?: { column: string; order: 'asc' | 'desc' };
    }
  ) => {
    try {
      const { data, error: listError } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: options?.limit,
          offset: options?.offset,
          sortBy: options?.sortBy,
        });

      if (listError) {
        const errorMsg = getSupabaseErrorMessage(listError);
        console.error('❌ List files error:', listError);
        error('Lỗi tải danh sách file', errorMsg);
        return [];
      }

      return data || [];
    } catch (err) {
      const errorMsg = getSupabaseErrorMessage(err);
      console.error('❌ List files error:', err);
      error('Lỗi tải danh sách file', errorMsg);
      return [];
    }
  }, [error]);

  return {
    // State
    uploading,
    progress,
    
    // Operations
    uploadFile,
    uploadFiles,
    deleteFile,
    getFileUrl,
    listFiles,
    createBucket,
  };
};

// Utility function to extract file path from Supabase URL
export const extractFilePathFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    // Remove '/storage/v1/object/public/bucket-name' parts
    const relevantParts = pathParts.slice(6); // Adjust based on Supabase URL structure
    return relevantParts.join('/');
  } catch {
    return '';
  }
};

// Utility function to validate file type
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

// Utility function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
