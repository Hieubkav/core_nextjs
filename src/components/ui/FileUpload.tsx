'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, X, File, Image, Video, FileText } from 'lucide-react';
import { useFileUpload, UploadOptions, UploadResult } from '@/hooks/useFileUpload';
import { formatFileSize } from '@/hooks/useFileUpload';

interface FileUploadProps {
  // Upload configuration
  bucket: string;
  folder?: string;
  maxSizeInMB?: number;
  allowedTypes?: string[];
  multiple?: boolean;
  
  // UI configuration
  className?: string;
  placeholder?: string;
  showPreview?: boolean;
  showProgress?: boolean;
  disabled?: boolean;
  
  // Current value (for controlled component)
  value?: string | string[];
  
  // Callbacks
  onUploadSuccess?: (result: UploadResult | UploadResult[]) => void;
  onUploadError?: (error: string) => void;
  onChange?: (url: string | string[]) => void;
  onRemove?: (url: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  folder = 'uploads',
  maxSizeInMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  multiple = false,
  className = '',
  placeholder,
  showPreview = true,
  showProgress = true,
  disabled = false,
  value,
  onUploadSuccess,
  onUploadError,
  onChange,
  onRemove,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(
    Array.isArray(value) ? value : value ? [value] : []
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadFile, uploadFiles, uploading, progress } = useFileUpload();

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      onUploadError?.('Chỉ được chọn 1 file');
      return;
    }

    const uploadOptions: UploadOptions = {
      bucket,
      folder,
      maxSizeInMB,
      allowedTypes,
    };

    try {
      if (multiple) {
        const results = await uploadFiles(fileArray, uploadOptions);
        const urls = results.map(r => r.url);
        
        setUploadedFiles(prev => [...prev, ...urls]);
        onChange?.(uploadedFiles.concat(urls));
        onUploadSuccess?.(results);
      } else {
        const result = await uploadFile(fileArray[0], uploadOptions);
        if (result) {
          setUploadedFiles([result.url]);
          onChange?.(result.url);
          onUploadSuccess?.(result);
        }
      }
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    }
  }, [bucket, folder, maxSizeInMB, allowedTypes, multiple, uploadFile, uploadFiles, uploadedFiles, onChange, onUploadSuccess, onUploadError]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || uploading) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, uploading, handleFiles]);

  // Handle file input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled || uploading) return;
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [disabled, uploading, handleFiles]);

  // Handle remove file
  const handleRemove = useCallback((url: string) => {
    const newFiles = uploadedFiles.filter(f => f !== url);
    setUploadedFiles(newFiles);
    
    if (multiple) {
      onChange?.(newFiles);
    } else {
      onChange?.('');
    }
    
    onRemove?.(url);
  }, [uploadedFiles, multiple, onChange, onRemove]);

  // Get file icon based on type
  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="w-4 h-4" />;
    } else if (['mp4', 'webm', 'avi', 'mov'].includes(extension || '')) {
      return <Video className="w-4 h-4" />;
    } else if (['pdf'].includes(extension || '')) {
      return <FileText className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  // Get file name from URL
  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Unknown file';
  };

  const defaultPlaceholder = multiple 
    ? 'Kéo thả files vào đây hoặc click để chọn'
    : 'Kéa thả file vào đây hoặc click để chọn';

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.join(',')}
          onChange={handleChange}
          className="hidden"
          disabled={disabled || uploading}
        />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className={`w-8 h-8 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-600">
            {placeholder || defaultPlaceholder}
          </p>
          <p className="text-xs text-gray-500">
            Tối đa {maxSizeInMB}MB • {allowedTypes.map(type => type.split('/')[1]).join(', ')}
          </p>
        </div>
        
        {/* Progress Bar */}
        {uploading && showProgress && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Đang upload... {progress}%</p>
          </div>
        )}
      </div>
      
      {/* File Preview */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Files đã upload:</h4>
          <div className="space-y-2">
            {uploadedFiles.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
              >
                <div className="flex items-center space-x-2">
                  {getFileIcon(url)}
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    {getFileName(url)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Preview for images */}
                  {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                    <img
                      src={url}
                      alt="Preview"
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(url)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload Status */}
      {uploading && (
        <div className="mt-2 text-sm text-blue-600">
          Đang upload...
        </div>
      )}
    </div>
  );
};
