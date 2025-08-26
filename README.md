# 🚀 NextJS 15 Core Template with Supabase

A modern, production-ready NextJS 15 template with **Supabase integration**, TypeScript, Tailwind CSS 4, and comprehensive development tools.

## ✨ Features

### **🔥 Core Stack**
- **Next.js 15** - Latest version with App Router and Turbopack
- **TypeScript** - Full type safety with strict configuration
- **Tailwind CSS 4** - Latest version with CSS variables
- **shadcn/ui** - Beautiful, accessible components
- **Supabase** - Complete backend with database, auth, and storage
- **pnpm** - Fast, efficient package manager

### **🛠️ Development Tools**
- **React Hook Form + Zod** - Type-safe form validation
- **Toast Notifications** - User feedback system
- **File Upload** - Drag & drop with progress bars
- **CRUD Hooks** - Reusable database operations
- **Loading States** - Skeleton components and spinners
- **Error Handling** - Comprehensive error management

### **🚀 Production Ready**
- **Vercel Deployment** - Optimized for Vercel platform
- **Environment Configuration** - Easy setup with .env.example
- **Type Safety** - End-to-end TypeScript coverage
- **Performance** - Optimized hooks and components

## 📦 Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage
- **Form Handling:** React Hook Form + Zod
- **Notifications:** React Hot Toast
- **Package Manager:** pnpm
- **Deployment:** Vercel

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd core_nextjs
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup Supabase**
   ```bash
   # Create a new project at https://app.supabase.com
   # Copy .env.example to .env.local
   cp .env.example .env.local

   # Fill in your Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Visit demo page**
   ```
   http://localhost:3000/demo
   ```

## 🎯 Quick Usage

### **CRUD Operations**
```tsx
import { useCrud } from '@/hooks/useCrud';

function UsersList() {
  const { data, loading, create, update, remove } = useCrud('users');

  const handleCreate = () => create({
    email: 'user@example.com',
    full_name: 'John Doe'
  });

  return (
    <div>
      {loading ? <Skeleton /> : (
        data.map(user => <div key={user.id}>{user.email}</div>)
      )}
    </div>
  );
}
```

### **Form Validation**
```tsx
import { useContactForm } from '@/hooks/useForm';

function ContactForm() {
  const form = useContactForm();

  const handleSubmit = form.submitWithToast(async (data) => {
    await submitContact(data);
  });

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <input {...form.register('name')} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### **File Upload**
```tsx
import { FileUpload } from '@/components/ui/FileUpload';

function ImageUpload() {
  return (
    <FileUpload
      bucket="images"
      onUploadSuccess={(result) => console.log(result.url)}
    />
  );
}
```

### **Toast Notifications**
```tsx
import { useToast } from '@/hooks/useToast';

function MyComponent() {
  const { success, error } = useToast();

  const handleAction = async () => {
    try {
      await someAction();
      success('Thành công!');
    } catch (err) {
      error('Lỗi', err.message);
    }
  };
}
```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   └── common/        # Common components
├── lib/               # Utility libraries
│   ├── utils.ts       # General utilities
│   ├── mongodb.ts     # Database connection
│   └── cloudinary.ts  # Cloudinary configuration
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
├── models/            # Database models
└── config/            # Configuration files
```

## 🎨 UI Components

This template includes pre-configured shadcn/ui components:

- Button
- Card
- Input
- Label

Add more components:
```bash
pnpm dlx shadcn@latest add [component-name]
```

## 🗄️ Database

MongoDB integration with Mongoose:

- Connection handling with proper caching
- User model example
- Type-safe database operations

## 📸 Image Management

Cloudinary integration for:

- Image uploads
- Automatic optimization
- Image transformations
- CDN delivery

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Manual Deployment

```bash
pnpm build
pnpm start
```

## 🔧 Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Code Quality

- ESLint configuration
- TypeScript strict mode
- Prettier formatting (recommended)

## 📝 Environment Variables

Required environment variables:

```env
# Database
MONGODB_URI=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Next.js
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you have any questions or need help, please:

1. Check the documentation
2. Search existing issues
3. Create a new issue

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)

---

**Happy coding! 🎉**
