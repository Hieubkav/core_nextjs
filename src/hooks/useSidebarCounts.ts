import { useState, useEffect } from 'react'

interface SidebarCounts {
  images: number
  categories: number
  products: number
  orders: number
  sliders: number
  customers: number
}

export function useSidebarCounts() {
  const [counts, setCounts] = useState<SidebarCounts>({
    images: 0,
    categories: 0,
    products: 0,
    orders: 0,
    sliders: 0,
    customers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCounts()
  }, [])

  const fetchCounts = async () => {
    try {
      const response = await fetch('/api/admin/sidebar-counts')
      if (response.ok) {
        const data = await response.json()
        setCounts({
          images: data.images || 0,
          categories: data.categories || 0,
          products: data.products || 0,
          orders: data.orders || 0,
          sliders: data.sliders || 0,
          customers: data.customers || 0
        })
      }
    } catch (error) {
      console.error('Error fetching sidebar counts:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshCounts = () => {
    fetchCounts()
  }

  return { counts, loading, refreshCounts }
}
