'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  CogIcon,
  PhotoIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  PaintBrushIcon,
  TagIcon,
  ShoppingCartIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Sản phẩm', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Danh mục', href: '/admin/categories', icon: TagIcon },
  { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCartIcon },
  { name: 'Khách hàng', href: '/admin/customers', icon: UsersIcon },
  { name: 'Đánh giá', href: '/admin/reviews', icon: StarIcon },
  { name: 'Hình ảnh', href: '/admin/images', icon: PhotoIcon },
  { name: 'Slider', href: '/admin/sliders', icon: PaintBrushIcon },
  { name: 'Bài viết', href: '/admin/posts', icon: DocumentTextIcon },
  { name: 'FAQ', href: '/admin/faqs', icon: QuestionMarkCircleIcon },
  { name: 'Liên hệ', href: '/admin/contacts', icon: ChatBubbleLeftRightIcon },
  { name: 'Giao diện', href: '/admin/webdesign', icon: PaintBrushIcon },
  { name: 'Cài đặt', href: '/admin/settings', icon: CogIcon },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-gray-900">Digital Store Admin</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={classNames(
                        pathname === item.href
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      )}
                    >
                      <item.icon
                        className={classNames(
                          pathname === item.href ? 'text-blue-700' : 'text-gray-400 group-hover:text-blue-700',
                          'h-6 w-6 shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
