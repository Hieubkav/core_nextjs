'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
})

type SignInForm = z.infer<typeof signInSchema>

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true)
    setMessage('')

    try {
      const result = await signIn('email', {
        email: data.email,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setMessage('Có lỗi xảy ra. Vui lòng thử lại.')
      } else {
        setMessage('Chúng tôi đã gửi link đăng nhập đến email của bạn. Vui lòng kiểm tra hộp thư.')
      }
    } catch (error) {
      setMessage('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập vào Digital Store
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập email để nhận link đăng nhập
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Địa chỉ email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {message && (
            <div className={`p-4 rounded-md ${
              message.includes('gửi') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <p className="text-sm">{message}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang gửi...
                </div>
              ) : (
                'Gửi link đăng nhập'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Bằng cách đăng nhập, bạn đồng ý với{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Điều khoản sử dụng
              </a>{' '}
              và{' '}
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Chính sách bảo mật
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
