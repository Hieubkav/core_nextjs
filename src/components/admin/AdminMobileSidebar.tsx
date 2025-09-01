'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigation } from '@/components/admin/AdminSidebar'
import { useSidebarCounts } from '@/hooks/useSidebarCounts'

type Props = {
  open: boolean
  onClose: () => void
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminMobileSidebar({ open, onClose }: Props) {
  const pathname = usePathname()
  const { counts, loading } = useSidebarCounts()

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/50" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-200 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-200 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-64 max-w-xs flex-1">
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-xl">
                <div className="flex h-16 shrink-0 items-center justify-between">
                  <h1 className="text-lg font-bold text-gray-900">Digital Store Admin</h1>
                  <button
                    type="button"
                    className="-m-2.5 p-2.5 text-gray-700"
                    onClick={onClose}
                    aria-label="Close sidebar"
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const badgeCount = item.showBadge ? counts[item.showBadge as keyof typeof counts] : null
                          return (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={onClose}
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
                                <span className="flex-1">{item.name}</span>
                                {!loading && badgeCount !== null && badgeCount > 0 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {badgeCount}
                                  </span>
                                )}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

