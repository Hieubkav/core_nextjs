'use client';

import toast from 'react-hot-toast';

// Toast configuration
const toastConfig = {
  duration: 4000,
  position: 'top-right' as const,
  style: {
    borderRadius: '8px',
    background: '#333',
    color: '#fff',
    fontSize: '14px',
    maxWidth: '400px',
  },
};

// Success toast configuration
const successConfig = {
  ...toastConfig,
  style: {
    ...toastConfig.style,
    background: '#10b981',
  },
  iconTheme: {
    primary: '#fff',
    secondary: '#10b981',
  },
};

// Error toast configuration
const errorConfig = {
  ...toastConfig,
  style: {
    ...toastConfig.style,
    background: '#ef4444',
  },
  iconTheme: {
    primary: '#fff',
    secondary: '#ef4444',
  },
};

// Loading toast configuration
const loadingConfig = {
  ...toastConfig,
  style: {
    ...toastConfig.style,
    background: '#3b82f6',
  },
};

// Warning toast configuration
const warningConfig = {
  ...toastConfig,
  style: {
    ...toastConfig.style,
    background: '#f59e0b',
  },
  iconTheme: {
    primary: '#fff',
    secondary: '#f59e0b',
  },
};

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToast = () => {
  // Success toast
  const success = (message: string, options?: ToastOptions) => {
    const toastMessage = options?.title 
      ? `${options.title}\n${message}` 
      : message;
    
    return toast.success(toastMessage, {
      ...successConfig,
      duration: options?.duration || successConfig.duration,
    });
  };

  // Error toast
  const error = (title: string, message?: string, options?: ToastOptions) => {
    const toastMessage = message 
      ? `${title}\n${message}` 
      : title;
    
    return toast.error(toastMessage, {
      ...errorConfig,
      duration: options?.duration || errorConfig.duration,
    });
  };

  // Loading toast
  const loading = (message: string, options?: ToastOptions) => {
    const toastMessage = options?.title 
      ? `${options.title}\n${message}` 
      : message;
    
    return toast.loading(toastMessage, {
      ...loadingConfig,
      duration: options?.duration || loadingConfig.duration,
    });
  };

  // Warning toast
  const warning = (message: string, options?: ToastOptions) => {
    const toastMessage = options?.title 
      ? `${options.title}\n${message}` 
      : message;
    
    return toast(toastMessage, {
      ...warningConfig,
      icon: '⚠️',
      duration: options?.duration || warningConfig.duration,
    });
  };

  // Info toast
  const info = (message: string, options?: ToastOptions) => {
    const toastMessage = options?.title 
      ? `${options.title}\n${message}` 
      : message;
    
    return toast(toastMessage, {
      ...toastConfig,
      icon: 'ℹ️',
      duration: options?.duration || toastConfig.duration,
    });
  };

  // Promise toast - for async operations
  const promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        ...toastConfig,
        duration: options?.duration || toastConfig.duration,
      }
    );
  };

  // Dismiss toast
  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  // Dismiss all toasts
  const dismissAll = () => {
    toast.dismiss();
  };

  // Custom toast with full control
  const custom = (message: string, options?: {
    type?: 'success' | 'error' | 'loading' | 'blank';
    icon?: string;
    duration?: number;
    style?: React.CSSProperties;
  }) => {
    const config = {
      ...toastConfig,
      duration: options?.duration || toastConfig.duration,
      style: { ...toastConfig.style, ...options?.style },
    };

    if (options?.icon) {
      return toast(message, { ...config, icon: options.icon });
    }

    switch (options?.type) {
      case 'success':
        return toast.success(message, config);
      case 'error':
        return toast.error(message, config);
      case 'loading':
        return toast.loading(message, config);
      default:
        return toast(message, config);
    }
  };

  return {
    success,
    error,
    loading,
    warning,
    info,
    promise,
    dismiss,
    dismissAll,
    custom,
  };
};

// Utility functions for common use cases
export const toastUtils = {
  // CRUD operation toasts
  crud: {
    creating: (entity: string) => toast.loading(`Đang tạo ${entity}...`, loadingConfig),
    created: (entity: string) => toast.success(`Tạo ${entity} thành công!`, successConfig),
    updating: (entity: string) => toast.loading(`Đang cập nhật ${entity}...`, loadingConfig),
    updated: (entity: string) => toast.success(`Cập nhật ${entity} thành công!`, successConfig),
    deleting: (entity: string) => toast.loading(`Đang xóa ${entity}...`, loadingConfig),
    deleted: (entity: string) => toast.success(`Xóa ${entity} thành công!`, successConfig),
    error: (action: string, entity: string, error?: string) => 
      toast.error(`Lỗi ${action} ${entity}${error ? `: ${error}` : ''}`, errorConfig),
  },

  // File upload toasts
  upload: {
    uploading: (fileName?: string) => 
      toast.loading(`Đang tải lên${fileName ? ` ${fileName}` : ''}...`, loadingConfig),
    uploaded: (fileName?: string) => 
      toast.success(`Tải lên${fileName ? ` ${fileName}` : ''} thành công!`, successConfig),
    error: (error?: string) => 
      toast.error(`Lỗi tải lên${error ? `: ${error}` : ''}`, errorConfig),
  },

  // Form validation toasts
  form: {
    invalid: (message?: string) => 
      toast.error(`Dữ liệu không hợp lệ${message ? `: ${message}` : ''}`, errorConfig),
    submitted: () => 
      toast.success('Gửi form thành công!', successConfig),
    submitting: () => 
      toast.loading('Đang gửi form...', loadingConfig),
  },

  // Auth toasts
  auth: {
    loginSuccess: () => toast.success('Đăng nhập thành công!', successConfig),
    loginError: (error?: string) => toast.error(`Lỗi đăng nhập${error ? `: ${error}` : ''}`, errorConfig),
    logoutSuccess: () => toast.success('Đăng xuất thành công!', successConfig),
    registerSuccess: () => toast.success('Đăng ký thành công!', successConfig),
    registerError: (error?: string) => toast.error(`Lỗi đăng ký${error ? `: ${error}` : ''}`, errorConfig),
  },
};
