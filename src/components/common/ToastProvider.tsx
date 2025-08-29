'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import Toast, { ToastMessage, ToastType } from './Toast'

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (type: ToastType, title: string, message?: string, duration?: number) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration: duration || 5000
    }

    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showToast = (type: ToastType, title: string, message?: string, duration?: number) => {
    addToast(type, title, message, duration)
  }

  const showSuccess = (title: string, message?: string) => {
    addToast('success', title, message)
  }

  const showError = (title: string, message?: string) => {
    addToast('error', title, message)
  }

  const showWarning = (title: string, message?: string) => {
    addToast('warning', title, message)
  }

  const showInfo = (title: string, message?: string) => {
    addToast('info', title, message)
  }

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div
        aria-live="assertive"
        className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
      >
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}