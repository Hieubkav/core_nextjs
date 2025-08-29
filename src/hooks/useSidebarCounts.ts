import { useState, useEffect } from 'react'

interface SidebarCounts {
  images: number
  categories: number
  products: number
}

export function useSidebarCounts() {
  const [counts, setCounts] = useState<SidebarCounts>({
    images: 0,
    categories: 0,
    products: 0
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
        setCounts(data)
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
