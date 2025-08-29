'use client'

import { useState, useEffect } from 'react'
import { Tab } from '@headlessui/react'
import { 
  CogIcon,
  SwatchIcon,
  ShareIcon,
  CreditCardIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import SettingsImageUpload from '@/components/admin/SettingsImageUpload'

interface Setting {
  id: number
  key: string
  value: string
  group: string
  label: string
  description?: string
  type: string
  createdAt: string
  updatedAt: string
}

interface SettingsData {
  general: Setting[]
  branding: Setting[]
  social: Setting[]
  payment: Setting[]
  seo: Setting[]
}

const tabs = [
  { id: 'general', name: 'Chung', icon: CogIcon },
  { id: 'branding', name: 'Thương hiệu', icon: SwatchIcon },
  { id: 'social', name: 'Mạng xã hội', icon: ShareIcon },
  { id: 'payment', name: 'Thanh toán', icon: CreditCardIcon },
  { id: 'seo', name: 'SEO', icon: MagnifyingGlassIcon },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    general: [],
    branding: [],
    social: [],
    payment: [],
    seo: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedTabIndex, setSelectedTabIndex] = useState(0)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const result = await response.json()
        setSettings(result.data)
        
        // Initialize form data
        const initialFormData: Record<string, string> = {}
        Object.values(result.data).flat().forEach((setting) => {
          const settingData = setting as Setting
          initialFormData[settingData.key] = settingData.value
        })
        setFormData(initialFormData)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: formData }),
      })

      const result = await response.json()

      if (result.success) {
        setHasChanges(false)
        await fetchSettings() // Refresh data
        alert('Cập nhật settings thành công!')
      } else {
        alert('Lỗi: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Có lỗi xảy ra khi lưu settings')
    } finally {
      setSaving(false)
    }
  }

  const renderSettingField = (setting: Setting) => {
    const value = formData[setting.key] || ''
    
    switch (setting.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={setting.description}
          />
        )
      
      case 'image_upload':
        return (
          <SettingsImageUpload
            value={value}
            onChange={(newValue) => handleInputChange(setting.key, newValue)}
            label={setting.label}
            description={setting.description}
          />
        )
      
      case 'color':
        return (
          <div className="mt-1 flex items-center space-x-3">
            <input
              type="color"
              value={value}
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
              className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="#000000"
            />
          </div>
        )
      
      case 'boolean':
        return (
          <div className="mt-1">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={value === 'true'}
                onChange={(e) => handleInputChange(setting.key, e.target.checked ? 'true' : 'false')}
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-sm text-gray-600">Bật tính năng này</span>
            </label>
          </div>
        )
      
      case 'image':
        return (
          <div className="mt-1">
            <input
              type="url"
              value={value}
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            {value && (
              <div className="mt-2">
                <img
                  src={value}
                  alt={setting.label}
                  className="h-20 w-20 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>
        )
      
      default: // text, email, url
        return (
          <input
            type={setting.type === 'email' ? 'email' : setting.type === 'url' ? 'url' : 'text'}
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={setting.description}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
            <p className="mt-2 text-sm text-gray-700">
              Quản lý các cài đặt cơ bản của website
            </p>
          </div>
          
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <Tab.Group selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
          <Tab.List className="flex space-x-1 rounded-t-lg bg-blue-50 p-1">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 ${
                    selected
                      ? 'bg-white shadow text-blue-900'
                      : 'text-blue-600 hover:bg-white/[0.12] hover:text-blue-800'
                  }`
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels className="p-6">
            {tabs.map((tab) => (
              <Tab.Panel key={tab.id} className="focus:outline-none">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {settings[tab.id as keyof SettingsData]?.map((setting) => (
                    <div key={setting.key} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {setting.label}
                      </label>
                      {setting.description && (
                        <p className="text-xs text-gray-500">{setting.description}</p>
                      )}
                      {renderSettingField(setting)}
                    </div>
                  ))}
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
}