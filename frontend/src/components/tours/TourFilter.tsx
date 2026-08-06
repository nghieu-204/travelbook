/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp, ChevronRight, Star } from 'lucide-react'

// --- SUBCOMPONENTS ---

// 1. Accordion Wrapper
const Accordion = ({ title, isOpenDefault = false, children }: { title: string, isOpenDefault?: boolean, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault)
  return (
    <div className="border-b border-gray-200 py-5">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-bold text-slate-800 focus:outline-none"
      >
        {title}
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      <div className={`mt-4 transition-all duration-300 overflow-visible ${isOpen ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  )
}

// 2. Dual Range Slider
const DualRangeSlider = ({ value, onChange }: { value: [number, number], onChange: (val: [number, number]) => void }) => {
  const min = 0;
  const max = 99990000;
  
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), value[1] - 500000);
    onChange([newMin, value[1]]);
  }
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), value[0] + 500000);
    onChange([value[0], newMax]);
  }

  const minPercent = ((value[0] - min) / (max - min)) * 100;
  const maxPercent = ((value[1] - min) / (max - min)) * 100;

  return (
    <div className="relative pt-2 pb-2">
      <div className="slider relative h-1.5 rounded-full bg-gray-200">
        <div 
          className="absolute h-1.5 bg-blue-600 rounded-full"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />
      </div>
      <div className="relative">
        <input 
          type="range" min={min} max={max} step="500000" value={value[0]} onChange={handleMinChange}
          className="absolute w-full -top-1.5 h-1.5 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
        />
        <input 
          type="range" min={min} max={max} step="500000" value={value[1]} onChange={handleMaxChange}
          className="absolute w-full -top-1.5 h-1.5 bg-transparent appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
        />
      </div>
      <div className="flex justify-between items-center mt-5 text-sm font-semibold text-blue-700 bg-blue-50 py-2 px-3 rounded-lg">
        <span>{value[0].toLocaleString('vi-VN')}đ</span>
        <span>-</span>
        <span>{value[1].toLocaleString('vi-VN')}đ</span>
      </div>
    </div>
  )
}

// 3. Tree Checkbox Component for Destinations
const TreeCheckbox = ({ node, isRoot = false, selected, onChange }: { node: any, isRoot?: boolean, selected: string[], onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(isRoot);
  
  const hasChildren = node.children && node.children.length > 0;
  const isChecked = selected.includes(node.name);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 py-1.5 group">
        {hasChildren ? (
          <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-slate-600 w-5 h-5 flex items-center justify-center">
            <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          </button>
        ) : (
          <div className="w-5 h-5"></div>
        )}
        <label className="flex items-center gap-2 cursor-pointer flex-1">
          <input 
            type="checkbox" 
            checked={isChecked}
            onChange={() => onChange(node.name)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span className={`text-sm transition-colors ${isChecked ? 'font-semibold text-blue-700' : 'font-medium text-slate-700 group-hover:text-blue-600'}`}>
            {node.name}
          </span>
        </label>
      </div>
      {hasChildren && isOpen && (
        <div className="ml-5 border-l border-gray-200 pl-2">
          {node.children.map((child: any) => (
            <TreeCheckbox key={child.name} node={child} selected={selected} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  )
}


// --- MAIN COMPONENT ---
export default function TourFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // METADATA STATE
  const [metadata, setMetadata] = useState<any>({
    domestic: [],
    international: [],
    tourTypes: [],
    departureLocations: []
  })
  const [isLoading, setIsLoading] = useState(true)

  // Fetch metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api') + '/tours/filters-metadata');
        if (res.ok) {
          const data = await res.json();
          // Transform domestic and international to Tree format
          const domesticTree = data.domestic.map((r: any) => ({
            name: r.region,
            children: r.provinces ? r.provinces.map((p: any) => ({
              name: p.name,
              children: p.destinations.map((d: string) => ({ name: d, children: [] }))
            })) : []
          }));
          const intlTree = data.international.map((r: any) => ({
            name: r.region,
            children: r.countries.map((c: any) => ({
              name: c.country,
              children: c.destinations.map((d: string) => ({ name: d, children: [] }))
            }))
          }));
          setMetadata({ ...data, domesticTree, intlTree });
        }
      } catch (error) {
        console.error("Lỗi lấy filter metadata:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetadata();
  }, []);

  // STATE MANAGEMENT
  const [filterParams, setFilterParams] = useState({
    category: (searchParams.get('category') as 'Trong nước' | 'Quốc tế' | '') || '',
    priceRange: [
      searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0,
      searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 99990000
    ] as [number, number],
    destinations: searchParams.getAll('destination').concat(searchParams.getAll('region'), searchParams.getAll('location')),
    tourTypes: searchParams.getAll('tourType'),
    departureLocations: searchParams.getAll('departureLocation'),
    durations: searchParams.getAll('duration'),
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : 0
  })

  // Cập nhật state nếu URL thay đổi từ bên ngoài
  const syncFromUrl = useCallback(() => {
    const cat = searchParams.get('category') as 'Trong nước' | 'Quốc tế' | '';
    if (cat !== null) {
       setFilterParams(prev => {
         if (cat === prev.category) return prev;
         return { ...prev, category: cat || '', destinations: searchParams.getAll('destination') };
       });
    }
  }, [searchParams])

  useEffect(() => {
    syncFromUrl()
  }, [syncFromUrl])

  // Update State Helpers
  const updateState = (key: keyof typeof filterParams, value: any) => {
    setFilterParams(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayState = (key: 'destinations' | 'tourTypes' | 'departureLocations' | 'durations', value: string) => {
    setFilterParams(prev => {
      const arr = prev[key]
      return { ...prev, [key]: arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value] }
    })
  }

  const clearAll = () => {
    setFilterParams(prev => ({
      category: prev.category,
      priceRange: [0, 99990000],
      destinations: [],
      tourTypes: [], 
      departureLocations: [],
      durations: [], 
      rating: 0
    }))
  }

  const isInitialMount = useRef(true);
  const searchParamsRef = useRef(searchParams);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // Trigger API Update
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      if (filterParams.category) params.set('category', filterParams.category)
      
      if (filterParams.priceRange[0] > 0) params.set('minPrice', filterParams.priceRange[0].toString())
      if (filterParams.priceRange[1] < 99990000) params.set('maxPrice', filterParams.priceRange[1].toString())
      
      if (filterParams.destinations.length > 0) {
         filterParams.destinations.forEach(d => params.append('location', d))
      }
      
      if (filterParams.tourTypes.length > 0) {
         filterParams.tourTypes.forEach(t => params.append('tourType', t))
      }

      if (filterParams.departureLocations.length > 0) {
         filterParams.departureLocations.forEach(dl => params.append('departureLocation', dl))
      }

      if (filterParams.durations.length > 0) {
         filterParams.durations.forEach(d => params.append('duration', d))
      }

      if (filterParams.rating > 0) params.set('rating', filterParams.rating.toString())
      
      const q = searchParamsRef.current.get('q')
      if (q) params.set('q', q)
      const sort = searchParamsRef.current.get('sort')
      if (sort) params.set('sort', sort)

      console.log('PUSHING URL:', `/tours?${params.toString()}`);
      router.push(`/tours?${params.toString()}`, { scroll: false })
    }, 500)
    
    return () => clearTimeout(timer)
  }, [filterParams, router])

  const destinationTree = filterParams.category === 'Trong nước' ? metadata.domesticTree : 
                          filterParams.category === 'Quốc tế' ? metadata.intlTree : 
                          [...(metadata.domesticTree || []), ...(metadata.intlTree || [])];

  if (isLoading) return <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24 animate-pulse h-[800px]"></div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
      
      {/* 1. Header & Tab Chuyển đổi */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Bộ Lọc</h2>
        <button onClick={clearAll} className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
          Xóa tất cả
        </button>
      </div>

      <div className="transition-opacity duration-300">
        
        {/* Accordion: Điểm đến (Tree) */}
        <Accordion title="Điểm đến" isOpenDefault={true}>
          <div className="max-h-[300px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {destinationTree?.map((node: any) => (
              <TreeCheckbox 
                key={node.name} 
                node={node} 
                isRoot={true} 
                selected={filterParams.destinations} 
                onChange={(val) => toggleArrayState('destinations', val)} 
              />
            ))}
            {destinationTree?.length === 0 && <div className="text-sm text-slate-500 py-2">Không có dữ liệu điểm đến.</div>}
          </div>
        </Accordion>

        {/* Accordion: Mức giá */}
        <Accordion title="Mức giá" isOpenDefault={true}>
          <DualRangeSlider 
            value={filterParams.priceRange} 
            onChange={(val) => updateState('priceRange', val)} 
          />
        </Accordion>

        {/* Accordion: Thời lượng */}
        <Accordion title="Thời lượng">
          <div className="space-y-3">
            {['1-3 ngày', '4-7 ngày', 'Trên 7 ngày'].map(dur => (
              <label key={dur} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={filterParams.durations.includes(dur)}
                  onChange={() => toggleArrayState('durations', dur)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{dur}</span>
              </label>
            ))}
          </div>
        </Accordion>

        {/* Accordion: Loại hình Tour */}
        {metadata.tourTypes && metadata.tourTypes.length > 0 && (
          <Accordion title="Loại hình Tour">
            <div className="space-y-3">
              {metadata.tourTypes.map((type: string) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={filterParams.tourTypes.includes(type)}
                    onChange={() => toggleArrayState('tourTypes', type)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{type}</span>
                </label>
              ))}
            </div>
          </Accordion>
        )}

        {/* Accordion: Điểm khởi hành */}
        {metadata.departureLocations && metadata.departureLocations.length > 0 && (
          <Accordion title="Điểm khởi hành">
            <div className="space-y-3">
              {metadata.departureLocations.map((loc: string) => (
                <label key={loc} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={filterParams.departureLocations.includes(loc)}
                    onChange={() => toggleArrayState('departureLocations', loc)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{loc}</span>
                </label>
              ))}
            </div>
          </Accordion>
        )}

        {/* Accordion: Đánh giá */}
        <Accordion title="Đánh giá (Rating)">
          <div className="space-y-3">
            {[5, 4, 3].map(star => (
              <label key={star} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="rating"
                  checked={filterParams.rating === star}
                  onChange={() => updateState('rating', star)}
                  className="w-5 h-5 border-gray-300 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                />
                <div className="flex items-center gap-1">
                  {Array.from({length: 5}).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < star ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-200'}`} />
                  ))}
                  <span className="text-sm font-medium text-slate-600 ml-1">{star < 5 && 'trở lên'}</span>
                </div>
              </label>
            ))}
          </div>
        </Accordion>

      </div>
    </div>
  )
}
