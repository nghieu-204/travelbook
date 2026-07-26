'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, CheckCircle2, Plus, Trash2,
  Map, Tag, Image as ImageIcon, FileText, Settings, Calendar, RefreshCw
} from 'lucide-react'
import { fetchApi } from '@/lib/api'
import SearchableAdminDropdown from '@/components/ui/SearchableAdminDropdown'
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown'
import RichTextEditor from '@/components/ui/RichTextEditor'

interface Metadata {
  tourTypes: any[];
  occasions: any[];
}

type Destination = { id: number; name: string; };
type Region = { id: number; name: string; destinations: Destination[]; };
type Category = { id: number; name: string; regions: Region[]; };

export default function CreateTourV2() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  
  // Metadata state
  const [metadata, setMetadata] = useState<Metadata>({ tourTypes: [], occasions: [] })
  const [hierarchy, setHierarchy] = useState<Category[]>([])

  // Form states
  const [categoryId, setCategoryId] = useState<string>('')
  const [regionId, setRegionId] = useState<string>('')
  const [destinationId, setDestinationId] = useState<string>('')
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Active')

  const [startDate, setStartDate] = useState('')
  const [days, setDays] = useState('3')
  const [nights, setNights] = useState('2')
  const [priceAdult, setPriceAdult] = useState('')
  const [priceAdultStr, setPriceAdultStr] = useState('')
  const [priceChild, setPriceChild] = useState('')
  const [priceChildStr, setPriceChildStr] = useState('')
  const [maxSeats, setMaxSeats] = useState('1')

  const [selectedTypes, setSelectedTypes] = useState<number[]>([])
  const [selectedOccasions, setSelectedOccasions] = useState<number[]>([])

  const [mainImage, setMainImage] = useState<{preview: string, file?: any} | null>(null)
  const [galleryImages, setGalleryImages] = useState<Array<{preview: string, file?: any}>>([])

  const [itinerary, setItinerary] = useState([{ id: 1, title: '', description: '', meals: [] as string[] }])

  const loadMetadata = async () => {
    try {
      const [metaData, hierarchyData] = await Promise.all([
        fetchApi('/metadata'),
        fetchApi('/locations/hierarchy')
      ])
      if (metaData) setMetadata(metaData)
      if (hierarchyData && hierarchyData.success) setHierarchy(hierarchyData.data)
    } catch (error) {
      console.error("Failed to load metadata", error)
    }
  }

  useEffect(() => {
    loadMetadata()
  }, [])

  // Khối 1: Logic Cascading
  const activeCategory = hierarchy.find(c => c.id.toString() === categoryId)
  const activeRegion = activeCategory?.regions.find(r => r.id.toString() === regionId)

  const handleCategoryChange = (e: any) => {
    setCategoryId(e.target.value)
    setRegionId('')
    setDestinationId('')
  }

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRegionId(e.target.value)
    setDestinationId('')
  }

  const handleQuickAddDestination = async (name: string) => {
    if (!regionId) return;
    try {
      const res = await fetchApi('/destinations', {
        method: 'POST',
        data: { name, region_id: parseInt(regionId) }
      });
      if (res && res.destination) {
        // Cập nhật lại cây hierarchy với điểm đến mới
        setHierarchy(prev => prev.map(cat => {
          if (cat.id.toString() === categoryId) {
            return {
              ...cat,
              regions: cat.regions.map(reg => {
                if (reg.id.toString() === regionId) {
                  return { ...reg, destinations: [...reg.destinations, res.destination] }
                }
                return reg;
              })
            }
          }
          return cat;
        }));
        setDestinationId(String(res.destination.id));
      }
    } catch (error) {
      alert("Lỗi khi thêm điểm đến mới");
      throw error;
    }
  }

  // Khối 5: Upload Ảnh
  const handleMainImageDrop = (e: any) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setMainImage({ preview: URL.createObjectURL(file), file })
    }
  }

  const handleGalleryDrop = (e: any) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      const newImages = Array.from(e.dataTransfer.files).map((file: any) => ({
        preview: URL.createObjectURL(file),
        file
      }))
      setGalleryImages(prev => [...prev, ...newImages])
    }
  }

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index))
  }

  const handlePriceAdultChange = (val: string) => {
    const raw = val.replace(/\D/g, '');
    setPriceAdult(raw);
    setPriceAdultStr(raw ? Number(raw).toLocaleString('vi-VN') : '');
    
    if (raw) {
      const childPrice = Math.round(Number(raw) * 0.75).toString();
      setPriceChild(childPrice);
      setPriceChildStr(Number(childPrice).toLocaleString('vi-VN'));
    } else {
      setPriceChild('');
      setPriceChildStr('');
    }
  };

  const handlePriceChildChange = (val: string) => {
    const raw = val.replace(/\D/g, '');
    setPriceChild(raw);
    setPriceChildStr(raw ? Number(raw).toLocaleString('vi-VN') : '');
  };

  // Khối 6: Logic Lịch trình
  const addItineraryDay = () => {
    setItinerary([...itinerary, { id: Date.now(), title: '', description: '', meals: [] }])
  }
  const removeItineraryDay = (id: number) => {
    setItinerary(itinerary.filter(i => i.id !== id))
  }
  const updateItinerary = (id: number, field: string, value: any) => {
    setItinerary(itinerary.map(i => i.id === id ? { ...i, [field]: value } : i))
  }
  const toggleMeal = (id: number, meal: string) => {
    setItinerary(itinerary.map(i => {
      if (i.id === id) {
        const hasMeal = i.meals.includes(meal)
        return { ...i, meals: hasMeal ? i.meals.filter(m => m !== meal) : [...i.meals, meal] }
      }
      return i
    }))
  }

  // Khối 4: Logic Tags
  const toggleTag = (id: number, type: 'type' | 'occasion') => {
    if (type === 'type') {
      setSelectedTypes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
    } else {
      setSelectedOccasions(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
    }
  }

  const handleSave = async () => {
    if (!categoryId) { alert("Vui lòng chọn Loại Tour!"); return; }
    if (!regionId) { alert("Vui lòng chọn Vùng miền!"); return; }
    if (!destinationId) { alert("Vui lòng chọn Điểm đến chính!"); return; }
    if (!title.trim()) { alert("Vui lòng nhập Tên Tour!"); return; }
    if (!priceAdult) { alert("Vui lòng nhập Giá người lớn!"); return; }
    if (!mainImage) { alert("Vui lòng tải lên Ảnh đại diện!"); return; }
    if (itinerary.some(day => !day.title.trim())) {
      alert("Vui lòng nhập đầy đủ Tiêu đề cho các ngày trong lịch trình!"); return;
    }

    setIsSaving(true)
    try {
      await fetchApi('/tours/v2', {
        method: 'POST',
        data: {
          destination_id: destinationId,
          title, description, status,
          start_date: startDate,
          duration: `${days} Ngày ${nights} Đêm`,
          price_adult: Number(priceAdult),
          price_child: Number(priceChild),
          max_seats: Number(maxSeats),
          tour_types: selectedTypes,
          occasions: selectedOccasions,
          images: [
            ...(mainImage ? [{ url: mainImage.preview, isMain: true }] : []),
            ...galleryImages.map(img => ({ url: img.preview, isMain: false }))
          ],
          itinerary
        }
      })
      alert("Tạo Tour thành công!")
      router.push('/admin/tours')
    } catch (error) {
      console.error(error)
      alert("Có lỗi xảy ra khi lưu Tour")
    } finally {
      setIsSaving(false)
    }
  }

  const calculateEndDate = () => {
    if (!startDate) return '';
    const d = parseInt(days) || 1;
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return '';
    start.setDate(start.getDate() + (d - 1));
    return start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleDaysChange = (val: string) => {
    setDays(val);
    const d = parseInt(val);
    if (!isNaN(d) && d > 0) {
      setNights((d - 1).toString());
    } else {
      setNights('0');
    }
  };

  const isDurationError = parseInt(nights) > parseInt(days);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0f172a]">
      {/* Topbar */}
      <div className="h-16 border-b border-slate-800 bg-[#1e293b] flex items-center px-6 shrink-0 justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">Thêm Tour Mới (V2)</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:bg-slate-800 transition-colors text-sm">
            Hủy bỏ
          </button>
          <button 
            onClick={handleSave} disabled={isSaving || isDurationError}
            className={`px-6 py-2 rounded-lg font-bold text-white transition-colors text-sm flex items-center gap-2 ${isSaving || isDurationError ? 'bg-slate-600 cursor-not-allowed opacity-70' : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20'}`}
          >
            {isSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isSaving ? 'Đang lưu...' : 'Hoàn thành & Lưu'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
          
          {/* KHỐI 1: Phân loại & Vị trí */}
          <section className="bg-[#1e293b] rounded-2xl border border-slate-800">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#1e293b]/50 flex items-center gap-2 rounded-t-2xl">
              <Map className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-white">Khối 1: Phân loại & Vị trí</h2>
            </div>
            <div className="p-6 grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Loại Tour</label>
                <select value={categoryId} onChange={handleCategoryChange} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                  <option value="">-- Chọn Loại Tour --</option>
                  {hierarchy.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Vùng miền</label>
                <select value={regionId} onChange={handleRegionChange} disabled={!categoryId} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  <option value="">-- Chọn Vùng miền --</option>
                  {activeCategory?.regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Điểm đến chính</label>
                <SearchableAdminDropdown 
                  options={activeRegion?.destinations.map(d => ({ id: String(d.id), name: d.name })) || []}
                  value={destinationId}
                  onChange={(val) => setDestinationId(String(val))}
                  placeholder="-- Chọn Điểm đến --"
                  disabled={!regionId}
                  onQuickAdd={handleQuickAddDestination}
                />
              </div>
            </div>
          </section>

          {/* KHỐI 2: Thông tin cốt lõi */}
          <section className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#1e293b]/50 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-white">Khối 2: Thông tin cốt lõi</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Tên Tour</label>
                <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="VD: Khám phá Đà Nẵng - Hội An 4N3Đ" className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Mô tả tổng quan</label>
                <RichTextEditor value={description} onChange={setDescription} placeholder="Giới thiệu hấp dẫn về tour..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Trạng thái</label>
                <select value={status} onChange={(e)=>setStatus(e.target.value)} className="w-[200px] bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Active">Mở bán (Active)</option>
                  <option value="Draft">Bản nháp (Draft)</option>
                </select>
              </div>
            </div>
          </section>

          {/* KHỐI 3: Cấu hình Giá & Vận hành */}
          <section className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#1e293b]/50 flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-white">Khối 3: Giá & Vận hành</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Ngày khởi hành</label>
                <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Thời lượng</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      min="0" 
                      value={days} 
                      onChange={(e) => handleDaysChange(e.target.value)} 
                      className={`w-full bg-[#0f172a] border ${isDurationError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-blue-500'} rounded-xl pl-4 pr-12 py-3 text-white focus:ring-2 outline-none`}
                      placeholder="Số ngày"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">Ngày</span>
                  </div>
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      min="0" 
                      value={nights} 
                      onChange={(e) => setNights(e.target.value)} 
                      className={`w-full bg-[#0f172a] border ${isDurationError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-blue-500'} rounded-xl pl-4 pr-12 py-3 text-white focus:ring-2 outline-none`}
                      placeholder="Số đêm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">Đêm</span>
                  </div>
                </div>
                {isDurationError && (
                  <span className="text-red-500 text-sm mt-1 block">Số đêm không hợp lệ!</span>
                )}
                {startDate && !isDurationError && (
                  <p className="mt-2 text-sm text-slate-400">
                    Dự kiến kết thúc: <span className="font-medium text-slate-300">{calculateEndDate()}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Giá người lớn (VND)</label>
                <input type="text" min="0" value={priceAdultStr} onChange={(e)=>handlePriceAdultChange(e.target.value)} placeholder="0" className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Giá trẻ em (VND)</label>
                <input type="text" min="0" value={priceChildStr} onChange={(e)=>handlePriceChildChange(e.target.value)} placeholder="0" className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Số chỗ tối đa</label>
                <input 
                  type="number" 
                  min="1" 
                  value={maxSeats} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val > 0) setMaxSeats(e.target.value);
                    else if (e.target.value === '') setMaxSeats('');
                  }} 
                  onBlur={(e) => {
                    if (!e.target.value || parseInt(e.target.value) < 1) setMaxSeats('1');
                  }} 
                  placeholder="1" 
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                />
              </div>
            </div>
          </section>

          {/* KHỐI 4: Gắn nhãn (Tagging) */}
          <section className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#1e293b]/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-bold text-white flex items-center gap-3">
                  Khối 4: Gắn nhãn (Tagging)
                  <a href="/admin/tags" target="_blank" rel="noopener noreferrer" className="text-sm font-normal text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                    <Settings className="w-4 h-4" />
                    Quản lý nhãn
                  </a>
                </h2>
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  loadMetadata();
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f172a] border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Làm mới dữ liệu
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-8">
              <div>
                <MultiSelectDropdown
                  label="Loại hình Du lịch"
                  placeholder="Tìm và chọn loại hình..."
                  options={metadata.tourTypes.map(t => ({ id: t.id, label: t.name }))}
                  selectedIds={selectedTypes}
                  onChange={(ids) => setSelectedTypes(ids as number[])}
                />
              </div>
              <div>
                <MultiSelectDropdown
                  label="Dịp lễ / Sự kiện"
                  placeholder="Tìm và chọn dịp lễ..."
                  options={metadata.occasions.map(o => ({ id: o.id, label: o.name }))}
                  selectedIds={selectedOccasions}
                  onChange={(ids) => setSelectedOccasions(ids as number[])}
                />
              </div>
            </div>
          </section>

          {/* KHỐI 5: Quản lý Hình ảnh (Media) */}
          <section className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#1e293b]/50 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Khối 5: Quản lý Hình ảnh</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Ảnh đại diện */}
              <div className="col-span-1 border-r border-slate-700 pr-6">
                <h3 className="text-white font-medium mb-4">Ảnh đại diện (Bắt buộc)</h3>
                {mainImage ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video border-2 border-blue-500 group">
                    <img src={mainImage.preview} alt="Cover" className="w-full h-full object-cover" />
                    <button onClick={() => setMainImage(null)} className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/60 hover:bg-red-600 text-white rounded backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-blue-500/90 text-white text-xs text-center py-1 font-medium backdrop-blur-sm">
                      Ảnh đại diện
                    </div>
                  </div>
                ) : (
                  <>
                    <div 
                      onClick={() => document.getElementById('mainImageInput')?.click()}
                      onDragOver={(e) => e.preventDefault()} 
                      onDrop={handleMainImageDrop}
                      className="w-full aspect-video border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 hover:bg-[#0f172a] transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <p className="text-sm text-center px-4">Click hoặc Kéo thả 1 ảnh vào đây</p>
                    </div>
                    <input 
                      type="file" 
                      id="mainImageInput" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setMainImage({ preview: URL.createObjectURL(e.target.files[0]), file: e.target.files[0] })
                        }
                      }} 
                    />
                  </>
                )}
              </div>

              {/* Thư viện ảnh */}
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-white font-medium mb-4">Thư viện ảnh (Gallery)</h3>
                <div 
                  onClick={() => document.getElementById('galleryImageInput')?.click()}
                  onDragOver={(e) => e.preventDefault()} 
                  onDrop={handleGalleryDrop}
                  className="w-full h-24 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 hover:bg-[#0f172a] transition-all cursor-pointer mb-4"
                >
                  <p className="text-sm">Click hoặc Kéo thả nhiều ảnh vào đây</p>
                </div>
                <input 
                  type="file" 
                  id="galleryImageInput" 
                  className="hidden" 
                  accept="image/*" 
                  multiple 
                  onChange={(e) => {
                    if (e.target.files) {
                      const newImages = Array.from(e.target.files).map((file: any) => ({
                        preview: URL.createObjectURL(file), file
                      }))
                      setGalleryImages(prev => [...prev, ...newImages])
                    }
                  }} 
                />
                
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-2">
                    {galleryImages.map((img, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden aspect-video border border-slate-700 group">
                        <img src={img.preview} alt="Gallery" className="w-full h-full object-cover" />
                        <button onClick={() => removeGalleryImage(index)} className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/60 hover:bg-red-600 text-white rounded backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* KHỐI 6: Lịch trình */}
          <section className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#1e293b]/50 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-white">Khối 6: Lịch trình (Itinerary)</h2>
            </div>
            <div className="p-6 space-y-4">
              {itinerary.map((day, index) => (
                <div key={day.id} className="p-5 border border-slate-700 bg-[#0f172a] rounded-xl relative group">
                  <button onClick={() => removeItineraryDay(day.id)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Tiêu đề (Ngày {index + 1})</label>
                    <input value={day.title} onChange={(e) => updateItinerary(day.id, 'title', e.target.value)} placeholder="VD: Hà Nội - Đà Nẵng" className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-white outline-none" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Hoạt động chi tiết</label>
                    <RichTextEditor value={day.description} onChange={(val) => updateItinerary(day.id, 'description', val)} placeholder="Mô tả các hoạt động trong ngày..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Bữa ăn bao gồm</label>
                    <div className="flex gap-4">
                      {['Sáng', 'Trưa', 'Tối'].map(meal => (
                        <label key={meal} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                          <input type="checkbox" checked={day.meals.includes(meal)} onChange={() => toggleMeal(day.id, meal)} className="w-4 h-4 rounded border-slate-600 bg-[#1e293b] text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900" />
                          {meal}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              <button onClick={addItineraryDay} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 hover:bg-[#0f172a] transition-all flex items-center justify-center gap-2 font-medium">
                <Plus className="w-5 h-5" /> Thêm Ngày Mới
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
