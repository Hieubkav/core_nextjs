// Application constants

export const APP_CONFIG = {
  name: "NextJS Core Template",
  description: "A modern NextJS 15 template with TypeScript, Tailwind CSS, and more",
  version: "1.0.0",
  author: "Your Name",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;

export const API_ENDPOINTS = {
  users: "/api/users",
  products: "/api/products",
  orders: "/api/orders",
  categories: "/api/categories",
  upload: "/api/upload",
} as const;

export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
} as const;

export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-()]+$/,
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
} as const;

export const STORAGE_KEYS = {
  theme: "theme",
  user: "user",
  cart: "cart",
  preferences: "preferences",
} as const;

export const ROUTES = {
  home: "/",
  about: "/about",
  contact: "/contact",
  products: "/products",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  profile: "/profile",
} as const;

export const THEMES = {
  light: "light",
  dark: "dark",
  system: "system",
} as const;

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
