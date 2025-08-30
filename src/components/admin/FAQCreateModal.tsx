'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface FAQCreateModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function FAQCreateModal({ onClose, onSuccess }: FAQCreateModalProps) {
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    sortOrder: 0,
    isVisible: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Error creating FAQ:', error)
      alert('Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-[500px] max-w-[calc(100vw-2rem)]">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden max-h-[calc(100vh-2rem)] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Thêm câu hỏi thường gặp mới
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="space-y-4">
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Câu hỏi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập câu hỏi"
                  required
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Câu trả lời <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập câu trả lời..."
                  required
                />
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thứ tự sắp xếp
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Số nhỏ hơn sẽ hiển thị trước
                </p>
              </div>

              {/* Visibility */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Hiển thị câu hỏi này trên website
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving || !formData.question.trim() || !formData.answer.trim()}
                className="flex-1 px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Đang lưu...
                  </>
                ) : (
                  'Tạo câu hỏi'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}