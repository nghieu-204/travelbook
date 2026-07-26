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
  
  const [category, setCategory] = useState('Trong nước')
  const [region, setRegion] = useState('Miền Bắc')
  const [location, setLocation] = useState('')
  
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

  const [mainImage, setMainImage] = useState<{preview: string, file?: any} | null>(null)
  const [galleryImages, setGalleryImages] = useState<Array<{preview: string, file?: any}>>([])

  const [itinerary, setItinerary] = useState([{ id: 1, title: '', description: '', meals: [] as string[] }])

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

  const handleSave = async () => {
    if (!title.trim()) { alert("Vui lòng nhập Tên Tour!"); return; }
    if (!priceAdult) { alert("Vui lòng nhập Giá người lớn!"); return; }
    if (!mainImage) { alert("Vui lòng tải lên Ảnh đại diện!"); return; }
    
    setIsSaving(true)
    try {
      const payload = {
        name: title,
        location: location,
        region: region,
        category: category,
        price: Number(priceAdult),
        child_price: priceChild ? Number(priceChild) : 0,
        available_spots: maxSeats ? Number(maxSeats) : 30,
        departure_date: startDate,
        duration: `${days} Ngày ${nights} Đêm`,
        description: description,
        badge: 'Mới',
        itinerary: itinerary,
        image: mainImage?.preview || "https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        gallery: galleryImages.map(img => img.preview)
      };

      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/tours', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (res.ok) {
        alert("Tạo Tour thành công!")
        router.push('/admin/tours')
      } else {
        alert("Có lỗi xảy ra khi lưu Tour")
      }
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
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Trong nước">Trong nước</option>
                  <option value="Quốc tế">Quốc tế</option>
                  <option value="Trải nghiệm">Trải nghiệm</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Vùng miền</label>
                <select value={region} onChange={e => setRegion(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Miền Bắc">Miền Bắc</option>
                  <option value="Miền Trung">Miền Trung</option>
                  <option value="Miền Nam">Miền Nam</option>
                  <option value="Châu Á">Châu Á</option>
                  <option value="Châu Âu">Châu Âu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Điểm đến (Tỉnh/Thành)</label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="VD: Đà Nẵng" className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
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
