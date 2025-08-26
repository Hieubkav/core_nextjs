'use client';

import { useForm as useReactHookForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from './useToast';

// Enhanced form hook with Zod validation and toast integration
export function useForm<T extends z.ZodType<any, any, any>>(
  schema: T,
  options?: UseFormProps<z.infer<T>> & {
    showToastOnError?: boolean;
    showToastOnSuccess?: boolean;
    successMessage?: string;
  }
): UseFormReturn<z.infer<T>> & {
  submitWithToast: (
    onSubmit: (data: z.infer<T>) => Promise<void> | void,
    options?: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
    }
  ) => (data: z.infer<T>) => Promise<void>;
} {
  const { success, error, loading } = useToast();
  
  const form = useReactHookForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange', // Real-time validation
    ...options,
  });

  // Enhanced submit function with toast notifications
  const submitWithToast = (
    onSubmit: (data: z.infer<T>) => Promise<void> | void,
    submitOptions?: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
    }
  ) => {
    return async (data: z.infer<T>) => {
      let toastId: string | undefined;
      
      try {
        // Show loading toast
        if (submitOptions?.loadingMessage) {
          toastId = loading(submitOptions.loadingMessage);
        }
        
        // Execute submit function
        await onSubmit(data);
        
        // Dismiss loading toast
        if (toastId) {
          success(submitOptions?.successMessage || options?.successMessage || 'Thành công!');
        } else if (options?.showToastOnSuccess !== false) {
          success(submitOptions?.successMessage || options?.successMessage || 'Thành công!');
        }
        
        // Reset form if successful
        form.reset();
        
      } catch (err) {
        // Dismiss loading toast and show error
        const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
        
        if (options?.showToastOnError !== false) {
          error(
            submitOptions?.errorMessage || 'Lỗi',
            errorMessage
          );
        }
        
        console.error('Form submission error:', err);
      }
    };
  };

  return {
    ...form,
    submitWithToast,
  };
}

// Specific form hooks for common use cases
export const useContactForm = () => {
  const contactFormSchema = z.object({
    name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().regex(/^(\+84|0)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ').optional(),
    subject: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
    message: z.string().min(10, 'Tin nhắn phải có ít nhất 10 ký tự'),
    privacy_agreed: z.boolean().refine(val => val === true, {
      message: 'Bạn phải đồng ý với chính sách bảo mật',
    }),
  });

  return useForm(contactFormSchema, {
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      privacy_agreed: false,
    },
    successMessage: 'Gửi liên hệ thành công!',
  });
};

export const useLoginForm = () => {
  const loginFormSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(1, 'Mật khẩu là bắt buộc'),
    remember: z.boolean().optional(),
  });

  return useForm(loginFormSchema, {
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
    successMessage: 'Đăng nhập thành công!',
  });
};

export const useRegisterForm = () => {
  const registerFormSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Mật khẩu phải có ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'
      ),
    confirmPassword: z.string(),
    full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    phone: z.string().regex(/^(\+84|0)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ').optional(),
    terms_agreed: z.boolean().refine(val => val === true, {
      message: 'Bạn phải đồng ý với điều khoản sử dụng',
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

  return useForm(registerFormSchema, {
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      phone: '',
      terms_agreed: false,
    },
    successMessage: 'Đăng ký thành công!',
  });
};

export const useProductForm = () => {
  const productFormSchema = z.object({
    name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
    description: z.string().optional(),
    price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
    category_id: z.string().optional(),
    image_url: z.string().url('URL hình ảnh không hợp lệ').optional(),
    stock_quantity: z.number().min(0, 'Số lượng phải lớn hơn hoặc bằng 0'),
    is_active: z.boolean(),
  });

  return useForm(productFormSchema, {
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category_id: '',
      image_url: '',
      stock_quantity: 0,
      is_active: true,
    },
    successMessage: 'Lưu sản phẩm thành công!',
  });
};

export const useCategoryForm = () => {
  const categoryFormSchema = z.object({
    name: z.string().min(1, 'Tên danh mục là bắt buộc'),
    description: z.string().optional(),
    image_url: z.string().url('URL hình ảnh không hợp lệ').optional(),
    parent_id: z.string().optional(),
    sort_order: z.number().min(0),
    is_active: z.boolean(),
  });

  return useForm(categoryFormSchema, {
    defaultValues: {
      name: '',
      description: '',
      image_url: '',
      parent_id: '',
      sort_order: 0,
      is_active: true,
    },
    successMessage: 'Lưu danh mục thành công!',
  });
};

export const useUserForm = () => {
  const userFormSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').optional(),
    phone: z.string().regex(/^(\+84|0)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ').optional(),
    role: z.enum(['admin', 'user']),
    is_active: z.boolean(),
  });

  return useForm(userFormSchema, {
    defaultValues: {
      email: '',
      full_name: '',
      phone: '',
      role: 'user' as const,
      is_active: true,
    },
    successMessage: 'Lưu người dùng thành công!',
  });
};

// Utility function to get form field props for easier integration
export const getFieldProps = (form: UseFormReturn<any>, fieldName: string) => {
  const { register, formState: { errors } } = form;
  
  return {
    ...register(fieldName),
    error: errors[fieldName]?.message as string | undefined,
    hasError: !!errors[fieldName],
  };
};

// Utility function to handle form submission with loading state
export const handleFormSubmit = async <T>(
  form: UseFormReturn<T>,
  onSubmit: (data: T) => Promise<void> | void,
  options?: {
    resetOnSuccess?: boolean;
    showToast?: boolean;
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
  }
) => {
  const { success, error, loading } = useToast();
  let toastId: string | undefined;
  
  try {
    // Show loading toast
    if (options?.loadingMessage && options?.showToast !== false) {
      toastId = loading(options.loadingMessage);
    }
    
    // Get form data
    const data = form.getValues();
    
    // Execute submit function
    await onSubmit(data);
    
    // Show success toast
    if (options?.showToast !== false) {
      success(options?.successMessage || 'Thành công!');
    }
    
    // Reset form if requested
    if (options?.resetOnSuccess !== false) {
      form.reset();
    }
    
  } catch (err) {
    // Show error toast
    const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
    
    if (options?.showToast !== false) {
      error(
        options?.errorMessage || 'Lỗi',
        errorMessage
      );
    }
    
    console.error('Form submission error:', err);
    throw err; // Re-throw for caller to handle if needed
  }
};
