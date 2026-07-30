'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function TourSort() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get('sort') || 'popular'

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', e.target.value)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <select 
      value={currentSort}
      onChange={handleSortChange}
      className="border-slate-200 rounded-xl px-4 py-2 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer font-medium text-slate-700"
    >
      <option value="popular">Sắp xếp: Phổ biến nhất</option>
      <option value="price_asc">Giá: Thấp đến Cao</option>
      <option value="price_desc">Giá: Cao đến Thấp</option>
    </select>
  )
}
