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
  StarIcon,
} from '@heroicons/react/24/outline'

export type NavItem = {
  name: string
  href: string
  icon: (props: React.ComponentProps<'svg'>) => JSX.Element
  showBadge?:
    | 'products'
    | 'categories'
    | 'orders'
    | 'customers'
    | 'reviews'
    | 'images'
    | 'sliders'
    | 'posts'
    | 'faqs'
}

export const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Sản phẩm', href: '/admin/products', icon: ShoppingBagIcon, showBadge: 'products' },
  { name: 'Danh mục', href: '/admin/categories', icon: TagIcon, showBadge: 'categories' },
  { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCartIcon, showBadge: 'orders' },
  { name: 'Khách hàng', href: '/admin/customers', icon: UsersIcon, showBadge: 'customers' },
  { name: 'Đánh giá', href: '/admin/reviews', icon: StarIcon, showBadge: 'reviews' },
  { name: 'Hình ảnh', href: '/admin/images', icon: PhotoIcon, showBadge: 'images' },
  { name: 'Slider', href: '/admin/sliders', icon: PaintBrushIcon, showBadge: 'sliders' },
  { name: 'Bài viết', href: '/admin/posts', icon: DocumentTextIcon, showBadge: 'posts' },
  { name: 'FAQ', href: '/admin/faqs', icon: QuestionMarkCircleIcon, showBadge: 'faqs' },
  { name: 'Giao diện', href: '/admin/webdesign', icon: PaintBrushIcon },
  { name: 'Cài đặt', href: '/admin/settings', icon: CogIcon },
]

