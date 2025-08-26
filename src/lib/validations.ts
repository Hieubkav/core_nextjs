import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .min(1, 'Email là bắt buộc')
  .email('Email không hợp lệ');

export const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Mật khẩu phải có ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'
  );

export const phoneSchema = z
  .string()
  .regex(/^(\+84|0)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ')
  .optional()
  .or(z.literal(''));

export const urlSchema = z
  .string()
  .url('URL không hợp lệ')
  .optional()
  .or(z.literal(''));

// User schemas
export const userCreateSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').optional(),
  phone: phoneSchema,
  role: z.enum(['admin', 'user']).default('user'),
});

export const userUpdateSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').optional(),
  phone: phoneSchema,
  role: z.enum(['admin', 'user']).optional(),
  is_active: z.boolean().optional(),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

// Product schemas
export const productCreateSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  description: z.string().optional(),
  price: z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0'),
  category_id: z.string().optional(),
  image_url: urlSchema,
  images: z.array(z.string().url()).optional(),
  stock_quantity: z.number().min(0, 'Số lượng phải lớn hơn hoặc bằng 0').default(0),
  is_active: z.boolean().default(true),
});

export const productUpdateSchema = productCreateSchema.partial();

// Category schemas
export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc'),
  description: z.string().optional(),
  image_url: urlSchema,
  parent_id: z.string().optional(),
  sort_order: z.number().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

// Order schemas
export const orderCreateSchema = z.object({
  user_id: z.string().min(1, 'User ID là bắt buộc'),
  total_amount: z.number().min(0, 'Tổng tiền phải lớn hơn hoặc bằng 0'),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
  shipping_address: z.string().optional(),
  payment_method: z.string().optional(),
  payment_status: z.enum(['pending', 'paid', 'failed', 'refunded']).default('pending'),
  notes: z.string().optional(),
});

export const orderUpdateSchema = orderCreateSchema.partial();

export const orderItemCreateSchema = z.object({
  order_id: z.string().min(1, 'Order ID là bắt buộc'),
  product_id: z.string().min(1, 'Product ID là bắt buộc'),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
  unit_price: z.number().min(0, 'Đơn giá phải lớn hơn hoặc bằng 0'),
  total_price: z.number().min(0, 'Tổng giá phải lớn hơn hoặc bằng 0'),
});

// Settings schemas
export const settingsUpdateSchema = z.object({
  site_name: z.string().optional(),
  site_description: z.string().optional(),
  contact_email: emailSchema.optional(),
  contact_phone: phoneSchema,
  contact_address: z.string().optional(),
  social_facebook: urlSchema,
  social_instagram: urlSchema,
  social_twitter: urlSchema,
  logo_url: urlSchema,
  favicon_url: urlSchema,
});

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  message: z.string().min(10, 'Tin nhắn phải có ít nhất 10 ký tự'),
  privacy_agreed: z.boolean().refine(val => val === true, {
    message: 'Bạn phải đồng ý với chính sách bảo mật',
  }),
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'File là bắt buộc' }),
  bucket: z.string().min(1, 'Bucket name là bắt buộc'),
  folder: z.string().optional(),
  maxSizeInMB: z.number().min(1).max(50).default(5),
  allowedTypes: z.array(z.string()).optional(),
});

// Search/Filter schemas
export const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).optional(),
  sort_by: z.enum(['name', 'price', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

// Export types
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;
export type OrderItemCreateInput = z.infer<typeof orderItemCreateSchema>;

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

export const validatePhone = (phone: string): boolean => {
  return phoneSchema.safeParse(phone).success;
};

export const validateUrl = (url: string): boolean => {
  return urlSchema.safeParse(url).success;
};

// Form validation helper
export const getFieldError = (errors: any, fieldName: string): string | undefined => {
  const error = errors[fieldName];
  return error?.message;
};

// Custom validation rules
export const customValidations = {
  // Check if passwords match
  passwordsMatch: (password: string, confirmPassword: string) => {
    return password === confirmPassword || 'Mật khẩu xác nhận không khớp';
  },
  
  // Check if file size is valid
  fileSizeValid: (file: File, maxSizeInMB: number) => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes || `File quá lớn. Tối đa ${maxSizeInMB}MB`;
  },
  
  // Check if file type is valid
  fileTypeValid: (file: File, allowedTypes: string[]) => {
    return allowedTypes.includes(file.type) || 'Định dạng file không được hỗ trợ';
  },
  
  // Check if date is in the future
  futureDate: (date: Date) => {
    return date > new Date() || 'Ngày phải trong tương lai';
  },
  
  // Check if date is in the past
  pastDate: (date: Date) => {
    return date < new Date() || 'Ngày phải trong quá khứ';
  },
};
