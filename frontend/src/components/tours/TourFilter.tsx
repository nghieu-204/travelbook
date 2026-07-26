'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronUp, Search, Star, X } from 'lucide-react'

// --- MOCK DATA ---
const MOCK_DATA = {
  domestic: {
    regions: ['Miền Bắc', 'Miền Trung', 'Miền Nam'],
    destinations: ['Hà Nội', 'Đà Nẵng', 'Sapa', 'Phú Quốc', 'Huế', 'Hội An', 'Hạ Long', 'Đà Lạt']
  },
  international: {
    regions: ['Châu Á', 'Châu Âu', 'Châu Mỹ', 'Châu Úc'],
    destinations: ['Thái Lan', 'Nhật Bản', 'Hàn Quốc', 'Pháp', 'Mỹ', 'Úc', 'Singapore', 'Trung Quốc']
  },
  tourTypes: ['Nghỉ dưỡng', 'Khám phá', 'Văn hóa', 'Mạo hiểm', 'Trăng mật'],
  occasions: ['Hè', 'Lễ 30/4', 'Lễ 2/9', 'Tết Nguyên Đán', 'Giáng Sinh'],
  durations: ['1-3 ngày', '4-7 ngày', 'Trên 7 ngày']
}

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
  const max = 20000000;
  
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
        <span>{value[1] >= max ? '20tr+ VNĐ' : `${value[1].toLocaleString('vi-VN')}đ`}</span>
      </div>
    </div>
  )
}

// 3. Searchable Multi Select
const SearchableMultiSelect = ({ options, selected, onChange }: { options: string[], selected: string[], onChange: (val: string[]) => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter(s => s !== opt))
    else onChange([...selected, opt])
  }

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-slate-700 hover:bg-gray-100 transition-colors"
      >
        <span className="truncate">{selected.length > 0 ? `Đã chọn ${selected.length} điểm đến` : 'Chọn điểm đến...'}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100 relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full bg-gray-50 rounded-lg pl-9 pr-3 py-2.5 text-sm font-medium outline-none focus:ring-1 focus:ring-blue-500 placeholder:font-normal" 
              autoFocus
            />
          </div>
          <div className="max-h-[220px] overflow-y-auto p-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {filtered.length > 0 ? filtered.map(opt => (
              <label key={opt} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selected.includes(opt)} 
                  onChange={() => toggle(opt)} 
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer" 
                />
                <span className={`text-sm transition-colors ${selected.includes(opt) ? 'font-semibold text-blue-700' : 'font-medium text-slate-700'}`}>{opt}</span>
              </label>
            )) : (
              <div className="py-4 text-center text-sm text-slate-500 font-medium">Không tìm thấy địa điểm</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


// --- MAIN COMPONENT ---
export default function TourFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // STATE MANAGEMENT
  const [filterParams, setFilterParams] = useState({
    category: (searchParams.get('category') as 'Trong nước' | 'Ngoài nước') || 'Trong nước',
    priceRange: [0, 20000000] as [number, number],
    regions: [] as string[],
    destinations: searchParams.get('destination') ? [searchParams.get('destination') as string] : [] as string[],
    startDate: { from: '', to: '' },
    tourTypes: [] as string[],
    occasions: [] as string[],
    duration: '',
    rating: 0
  })

  // Cập nhật state nếu URL thay đổi (VD: User bấm từ trang chủ sang)
  useEffect(() => {
    const cat = searchParams.get('category') as 'Trong nước' | 'Ngoài nước';
    const dest = searchParams.get('destination');
    if (cat && (cat === 'Trong nước' || cat === 'Ngoài nước') && cat !== filterParams.category) {
       setFilterParams(prev => ({ ...prev, category: cat, destinations: dest ? [dest] : [] }));
    }
  }, [searchParams])

  // Dữ liệu động dựa vào Tab Category
  const activeData = filterParams.category === 'Trong nước' ? MOCK_DATA.domestic : MOCK_DATA.international

  // Xử lý hiệu ứng chuyển tab
  const [isFading, setIsFading] = useState(false)
  const handleCategoryChange = (cat: 'Trong nước' | 'Ngoài nước') => {
    if (cat === filterParams.category) return;
    setIsFading(true)
    setTimeout(() => {
      setFilterParams({
        ...filterParams,
        category: cat,
        regions: [], // Reset region & destination when changing tab
        destinations: []
      })
      setIsFading(false)
    }, 300)
  }

  // Update State Helpers
  const updateState = (key: keyof typeof filterParams, value: any) => {
    setFilterParams(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayState = (key: 'regions' | 'tourTypes' | 'occasions', value: string) => {
    setFilterParams(prev => {
      const arr = prev[key]
      return { ...prev, [key]: arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value] }
    })
  }

  const clearAll = () => {
    setFilterParams({
      category: 'Trong nước',
      priceRange: [0, 20000000],
      regions: [], destinations: [],
      startDate: { from: '', to: '' },
      tourTypes: [], occasions: [],
      duration: '', rating: 0
    })
  }

  // Trigger API Update (Tương lai có thể gắn vào useEffect)
  useEffect(() => {
    console.log("Filters Updated:", filterParams);
    // router.push(`?category=${filterParams.category}&...`)
  }, [filterParams])

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
      
      {/* 1. Header & Tab Chuyển đổi */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Bộ Lọc</h2>
        <button onClick={clearAll} className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
          Xóa tất cả
        </button>
      </div>



      <div className={`transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* 2. Accordion 1: Mức giá */}
        <Accordion title="Mức giá" isOpenDefault={true}>
          <DualRangeSlider 
            value={filterParams.priceRange} 
            onChange={(val) => updateState('priceRange', val)} 
          />
        </Accordion>

        {/* 3. Accordion 2: Vùng miền */}
        <Accordion title="Vùng miền" isOpenDefault={true}>
          <div className="space-y-3">
            {activeData.regions.map(region => (
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

        {/* 4. Accordion 3: Điểm đến */}
        <Accordion title="Điểm đến" isOpenDefault={true}>
          <SearchableMultiSelect 
            options={activeData.destinations}
            selected={filterParams.destinations}
            onChange={(val) => updateState('destinations', val)}
          />
        </Accordion>

        {/* 5. Accordion 4: Ngày khởi hành */}
        <Accordion title="Ngày khởi hành">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Từ ngày</label>
              <input 
                type="date" 
                value={filterParams.startDate.from}
                onChange={(e) => updateState('startDate', { ...filterParams.startDate, from: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Đến ngày</label>
              <input 
                type="date" 
                value={filterParams.startDate.to}
                onChange={(e) => updateState('startDate', { ...filterParams.startDate, to: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </Accordion>

        {/* 6. Accordion 5: Loại hình Tour */}
        <Accordion title="Loại hình Tour">
          <div className="space-y-3">
            {MOCK_DATA.tourTypes.map(type => (
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

        {/* 7. Accordion 6: Dịp lễ / Sự kiện */}
        <Accordion title="Dịp Lễ / Sự kiện">
          <div className="space-y-3">
            {MOCK_DATA.occasions.map(occ => (
              <label key={occ} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={filterParams.occasions.includes(occ)}
                  onChange={() => toggleArrayState('occasions', occ)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{occ}</span>
              </label>
            ))}
          </div>
        </Accordion>

        {/* 8. Accordion 7: Thời lượng */}
        <Accordion title="Thời lượng">
          <div className="flex flex-wrap gap-2">
            {MOCK_DATA.durations.map(dur => (
              <button 
                key={dur}
                onClick={() => updateState('duration', filterParams.duration === dur ? '' : dur)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${filterParams.duration === dur ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
              >
                {dur}
              </button>
            ))}
          </div>
        </Accordion>

        {/* 9. Accordion 8: Đánh giá */}
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
