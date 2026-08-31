/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp, Star, Search } from 'lucide-react'

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

export interface TourFilterProps {
  initialCategory?: string;
  initialRegions?: string[];
  initialDestinations?: string[];
  initialTourTypes?: string[];
  initialDepartureLocations?: string[];
  initialDurations?: string[];
  initialMinPrice?: number;
  initialMaxPrice?: number;
  initialRating?: number;
}

export default function TourFilter({
  initialCategory = '',
  initialRegions = [],
  initialDestinations = [],
  initialTourTypes = [],
  initialDepartureLocations = [],
  initialDurations = [],
  initialMinPrice = 0,
  initialMaxPrice = 99990000,
  initialRating = 0
}: TourFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // METADATA STATE
  const [metadata, setMetadata] = useState<any>({
    domestic: [],
    international: [],
    tourtypes: [],
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
          setMetadata(data);
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
    category: (initialCategory || 'Tất cả') as 'Tất cả' | 'Trong nước' | 'Quốc tế',
    regions: initialRegions,
    destinations: initialDestinations,
    tourTypes: initialTourTypes,
    priceRange: [initialMinPrice, initialMaxPrice] as [number, number],
    durations: initialDurations,
    rating: initialRating,
    departureLocations: initialDepartureLocations
  })

  // Compute unique regions and destinations based on category
  const { allRegions, allDestinations } = useMemo(() => {
    const regions = new Set<string>();
    const dests = new Set<string>();

    if (!filterParams.category || filterParams.category === 'Tất cả' || filterParams.category === 'Trong nước') {
      metadata.domestic?.forEach((r: any) => {
        if (r.region) regions.add(r.region);
        r.destinations?.forEach((d: string) => dests.add(d));
      });
    }
    
    if (!filterParams.category || filterParams.category === 'Tất cả' || filterParams.category === 'Quốc tế') {
      metadata.international?.forEach((r: any) => {
        if (r.region) regions.add(r.region);
        r.countries?.forEach((c: any) => {
          c.destinations?.forEach((d: string) => dests.add(d));
        });
      });
    }

    return {
      allRegions: Array.from(regions),
      allDestinations: Array.from(dests).sort()
    };
  }, [metadata, filterParams.category]);

  // Ref to track if user has manually interacted with filters
  const hasInteracted = useRef(false);

  // Search state for destinations
  const [destSearch, setDestSearch] = useState('');

  // Update State Helpers
  const updateState = (key: keyof typeof filterParams, value: any) => {
    hasInteracted.current = true;
    setFilterParams(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayState = (key: 'regions' | 'destinations' | 'tourTypes' | 'departureLocations' | 'durations', value: string) => {
    hasInteracted.current = true;
    setFilterParams(prev => {
      const arr = prev[key]
      return { ...prev, [key]: arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value] }
    })
  }

  const clearAll = () => {
    hasInteracted.current = true;
    setFilterParams(prev => ({
      category: 'Tất cả',
      regions: [],
      destinations: [],
      tourTypes: [], 
      priceRange: [0, 99990000],
      durations: [], 
      rating: 0,
      departureLocations: []
    }))
  }

  const searchParamsRef = useRef(searchParams);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // Trigger API Update only when user interacted
  useEffect(() => {
    if (!hasInteracted.current) {
      return;
    }

    const timer = setTimeout(() => {
      const params = new URLSearchParams()
      if (filterParams.category) params.set('category', filterParams.category)
      
      if (filterParams.regions.length > 0) {
        filterParams.regions.forEach(r => params.append('region', r))
      }

      if (filterParams.destinations.length > 0) {
         filterParams.destinations.forEach(d => params.append('location', d))
      }
      
      if (filterParams.tourTypes.length > 0) {
         filterParams.tourTypes.forEach(t => params.append('tourType', t))
      }

      if (filterParams.priceRange[0] > 0) params.set('minPrice', filterParams.priceRange[0].toString())
      if (filterParams.priceRange[1] < 99990000) params.set('maxPrice', filterParams.priceRange[1].toString())
      
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

  const filteredDestinations = allDestinations.filter(d => d.toLowerCase().includes(destSearch.toLowerCase()));

  if (isLoading) return <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24 animate-pulse h-[800px]"></div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
      
      {/* Header & Clear */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Bộ Lọc</h2>
        <button onClick={clearAll} className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
          Xóa tất cả
        </button>
      </div>

      <div className="transition-opacity duration-300">

        {/* 1. Loại tour (Radio/Tab) */}
        <div className="mb-6">
          <div className="flex bg-slate-100 rounded-lg p-1">
            {['Tất cả', 'Trong nước', 'Quốc tế'].map((cat) => (
              <button
                key={cat}
                onClick={() => updateState('category', cat)}
                className={`flex-1 text-[13px] font-bold py-2 rounded-md transition-all ${
                  filterParams.category === cat 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Khu vực (Checkbox) */}
        {allRegions.length > 0 && (
          <Accordion title="Khu vực" isOpenDefault={true}>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {allRegions.map((region: string) => (
                <label key={region} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={filterParams.regions.includes(region)}
                    onChange={() => toggleArrayState('regions', region)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{region}</span>
                </label>
              ))}
            </div>
          </Accordion>
        )}
        
        {/* 3. Điểm đến (Dropdown/Search + Checkbox) */}
        <Accordion title="Điểm đến" isOpenDefault={true}>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm điểm đến..."
              value={destSearch}
              onChange={(e) => setDestSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {filteredDestinations.map((dest: string) => (
              <label key={dest} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={filterParams.destinations.includes(dest)}
                  onChange={() => toggleArrayState('destinations', dest)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{dest}</span>
              </label>
            ))}
            {filteredDestinations.length === 0 && <div className="text-sm text-slate-500 py-2">Không tìm thấy điểm đến.</div>}
          </div>
        </Accordion>

        {/* 4. Chủ đề/Sở thích (Tour Types) */}
        {metadata.tourtypes && metadata.tourtypes.length > 0 && (
          <Accordion title="Chủ đề / Sở thích" isOpenDefault={true}>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
              {metadata.tourtypes.map((type: string) => (
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

        {/* 5. Khoảng giá (Range Slider) */}
        <Accordion title="Khoảng giá" isOpenDefault={true}>
          <DualRangeSlider 
            value={filterParams.priceRange} 
            onChange={(val) => updateState('priceRange', val)} 
          />
        </Accordion>

        {/* 6. Thời lượng (Checkbox) */}
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

        {/* 7. Đánh giá (Star Rating) */}
        <Accordion title="Đánh giá">
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
