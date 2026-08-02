/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, CheckCircle2, Plus, Trash2,
  Map, Tag, Image as ImageIcon, FileText, Settings, Calendar, RefreshCw, Info
} from 'lucide-react'
import { fetchApi } from '@/lib/api'
import RichTextEditor from '@/components/ui/RichTextEditor'
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown'

const DEFAULT_NOTES = [
  { id: 1, title: 'Giá tour bao gồm', content: '<ul><li>- Xe đưa đón khứ hồi</li><li>- Khách sạn tiêu chuẩn</li><li>- Các bữa ăn theo chương trình</li></ul>' },
  { id: 2, title: 'Giá tour không bao gồm', content: '<ul><li>- Chi phí cá nhân</li><li>- Tiền tip cho HDV</li></ul>' },
  { id: 3, title: 'Thông tin Visa', content: '<p>- Khách mang quốc tịch Việt Nam không cần xin Visa.<br/>- Khách mang quốc tịch nước ngoài cần kiểm tra lại với tư vấn viên.</p>' },
  { id: 4, title: 'Lưu ý giá trẻ em', content: '<p>- Trẻ em dưới 2 tuổi: Miễn phí (ngủ chung giường với người lớn).<br/>- Trẻ em từ 2 đến dưới 11 tuổi: 75% giá tour người lớn.<br/>- Trẻ em từ 11 tuổi trở lên: Tính bằng giá tour người lớn.</p>' },
  { id: 5, title: 'Điều kiện thanh toán', content: '<p>- Đặt cọc 50% tổng giá trị tour khi đăng ký.<br/>- Thanh toán phần còn lại trước 15 ngày khởi hành.</p>' },
  { id: 6, title: 'Điều kiện đăng ký', content: '<p>- Cung cấp danh sách đoàn gồm đầy đủ các thông tin cá nhân.<br/>- Hộ chiếu hoặc CCCD còn hạn sử dụng ít nhất 6 tháng.</p>' },
  { id: 7, title: 'Lưu ý về chuyển hoặc hủy tour', content: '<p>- Quý khách vui lòng thông báo bằng văn bản hoặc email và được công ty xác nhận.<br/>- Các yêu cầu chuyển/hủy qua điện thoại sẽ không được giải quyết.</p>' },
  { id: 8, title: 'Các điều kiện hủy tour đối với ngày thường', content: '<ul><li>- Hủy trước 15 ngày khởi hành: Hoàn 100% tiền cọc.</li><li>- Hủy từ 08 - 14 ngày trước khởi hành: Phạt 50% giá tour.</li><li>- Hủy từ 04 - 07 ngày trước khởi hành: Phạt 70% giá tour.</li><li>- Hủy trong vòng 03 ngày trước khởi hành: Phạt 100% giá tour.</li></ul>' }
];

export default function CreateTourV2() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  
  const [metadata, setMetadata] = useState<any>({ categories: [], regions: [], destinations: [], tourTypes: [], occasions: [] })
  
  const [categoryId, setCategoryId] = useState('')
  const [regionId, setRegionId] = useState('')
  const [destinationId, setDestinationId] = useState('')

  const [title, setTitle] = useState('')
  const [tourCode, setTourCode] = useState('')
  const [description, setDescription] = useState('')

  const [startDate, setStartDate] = useState('')
  const [days, setDays] = useState('3')
  const [nights, setNights] = useState('2')
  const [priceAdultStr, setPriceAdultStr] = useState('')
  const [priceChildStr, setPriceChildStr] = useState('')
  const [maxSeats, setMaxSeats] = useState('30')
  const [departureLocation, setDepartureLocation] = useState('TP. Hồ Chí Minh')

  const [selectedTypes, setSelectedTypes] = useState<number[]>([])
  const [selectedOccasions, setSelectedOccasions] = useState<number[]>([])

  const [mainImage, setMainImage] = useState<{ preview: string, file?: any } | null>(null)
  const [galleryImages, setGalleryImages] = useState<Array<{ preview: string, file?: any }>>([])

  const [itinerary, setItinerary] = useState([{ id: 1, day: 'Ngày 1', title: '', description: '', meals: [] as string[], image: '' }])
  const [notes, setNotes] = useState(DEFAULT_NOTES)

  const loadMetadata = () => {
    fetchApi('/metadata').then(data => {
      setMetadata(data)
      if (data.categories?.length > 0 && !categoryId) setCategoryId(data.categories[0].id.toString())
    }).catch(err => console.error('Lỗi tải metadata:', err))
  }

  useEffect(() => {
    loadMetadata()
  }, [])

  useEffect(() => {
    if (categoryId && metadata.regions) {
      const filteredRegions = metadata.regions.filter((r: any) => r.category_id.toString() === categoryId)
      if (filteredRegions.length > 0) {
        setRegionId(filteredRegions[0].id.toString())
      } else {
        setRegionId('')
        setDestinationId('')
      }
    }
  }, [categoryId, metadata.regions])

  useEffect(() => {
    if (destinationId && metadata.destinations?.length > 0) {
      const dest = metadata.destinations.find((d: any) => d.id.toString() === destinationId)
      if (dest) {
        setRegionId(dest.region_id.toString())
        const reg = metadata.regions?.find((r: any) => r.id === dest.region_id)
        if (reg) {
          setCategoryId(reg.category_id.toString())
        }
      }
    }
  }, [destinationId, metadata])

  // Auto-generate Tour Code
  useEffect(() => {
    if (destinationId && startDate && !tourCode) {
      const dest = metadata.destinations?.find((d: any) => d.id.toString() === destinationId);
      const destName = dest ? dest.name : 'TOUR';
      
      const cleanName = destName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const destAbbr = cleanName
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase())
        .join('')
        .replace(/[^A-Z]/g, '')
        .substring(0, 3);
        
      const dateObj = new Date(startDate);
      const ddmm = `${String(dateObj.getDate()).padStart(2, '0')}${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      
      setTourCode(`${destAbbr}-${ddmm}-${random}`);
    }
  }, [destinationId, startDate, tourCode, metadata.destinations]);

  const handlePriceAdultChange = (val: string) => {
    const raw = val.replace(/\D/g, '');
    setPriceAdultStr(raw ? Number(raw).toLocaleString('vi-VN') : '');
    if (raw) {
      const child = Math.round(Number(raw) * 0.75).toString();
      setPriceChildStr(Number(child).toLocaleString('vi-VN'));
    } else {
      setPriceChildStr('');
    }
  };

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    if (!title.trim()) { alert('Vui lòng nhập Tên Tour!'); return; }
    if (!priceAdultStr) { alert('Vui lòng nhập Giá người lớn!'); return; }
    if (!destinationId) { alert('Vui lòng chọn Điểm đến!'); return; }
    if (!mainImage) { alert('Vui lòng chọn ảnh đại diện!'); return; }
    if (Number(nights) > Number(days)) { alert('Số đêm không thể lớn hơn số ngày!'); return; }

    setIsSaving(true)
    try {
      let imageStr = '';
      if (mainImage?.file) {
        imageStr = await fileToBase64(mainImage.file);
      } else {
        imageStr = mainImage.preview.replace('http://localhost:8902', '');
      }

      const galleryArr = [];
      for (const img of galleryImages) {
        if (img.file) {
          galleryArr.push(await fileToBase64(img.file));
        } else {
          galleryArr.push(img.preview.replace('http://localhost:8902', ''));
        }
      }

      const payload = {
        name: title,
        destination_id: Number(destinationId),
        price: Number(priceAdultStr.replace(/\D/g, '')),
        child_price: Number(priceChildStr.replace(/\D/g, '') || '0'),
        available_spots: Number(maxSeats || '30'),
        departure_date: startDate,
        duration: `${days} Ngày ${nights} Đêm`,
        description,
        badge: 'Mới',
        tour_code: tourCode,
        itinerary: JSON.stringify(itinerary),
        notes: JSON.stringify(notes),
        image: imageStr,
        gallery: JSON.stringify(galleryArr),
        tourTypes: JSON.stringify(selectedTypes),
        occasions: JSON.stringify(selectedOccasions),
        departure_location: departureLocation
      }

      await fetchApi('/admin/tours', { method: 'POST', data: payload })
      alert('🎉 Tạo Tour thành công!')
      router.push('/admin/tours')
    } catch (error) {
      console.error(error)
      alert('Có lỗi xảy ra khi lưu Tour')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredRegions = metadata.regions?.filter((r: any) => r.category_id.toString() === categoryId) || []
  const filteredDestinations = metadata.destinations?.filter((d: any) => d.region_id.toString() === regionId) || []

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0f172a]">
      <div className="h-16 border-b border-slate-800 bg-[#1e293b] flex items-center px-6 shrink-0 justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-white tracking-tight">Thêm Tour Mới</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:bg-slate-800 transition-colors text-sm">Hủy bỏ</button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 rounded-lg font-bold text-white transition-colors text-sm flex items-center gap-2 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20">
            {isSaving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Lưu Tour
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
                <label className="block text-sm font-medium text-slate-400 mb-2">Loại Tour (Cấp 1)</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                  {metadata.categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Vùng miền (Cấp 2)</label>
                <select value={regionId} onChange={e => setRegionId(e.target.value)} disabled={!categoryId || filteredRegions.length === 0} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50">
                  {filteredRegions.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Điểm đến (Cấp 3)</label>
                <select value={destinationId} onChange={e => setDestinationId(e.target.value)} disabled={!regionId || filteredDestinations.length === 0} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50">
                  {filteredDestinations.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Tên Tour</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Khám phá Đà Nẵng - Hội An 4N3Đ" className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-400">Mã Tour</label>
                    <span className="text-xs text-slate-500 italic">Tự động sinh hoặc nhập thủ công</span>
                  </div>
                  <input value={tourCode} onChange={(e) => setTourCode(e.target.value)} placeholder="VD: NDSGN846-132" className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Mô tả tổng quan</label>
                <RichTextEditor value={description} onChange={setDescription} placeholder="Giới thiệu hấp dẫn về tour..." />
              </div>
            </div>
          </section>

          {/* KHỐI 3: Giá & Vận hành */}
          <section className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#1e293b]/50 flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-white">Khối 3: Giá & Vận hành</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-400">Ngày khởi hành</label>
                  {startDate && days && Number(days) > 0 && (
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded flex items-center gap-1">
                      K.thúc: {new Date(new Date(startDate).getTime() + (Number(days) - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
                <input type="date" min={todayStr} value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ colorScheme: 'dark' }} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Điểm khởi hành</label>
                <input type="text" value={departureLocation} onChange={(e) => setDepartureLocation(e.target.value)} placeholder="VD: TP. Hồ Chí Minh" className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Số ngày</label>
                  <input type="number" min="1" value={days} onChange={e => { setDays(e.target.value); setNights(String(Math.max(0, Number(e.target.value) - 1))) }} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Số đêm</label>
                  <input type="number" min="0" value={nights} onChange={e => setNights(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
                  {Number(nights) > Number(days) && (
                    <p className="text-xs font-semibold text-rose-500 mt-1">Số đêm không hợp lý</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Giá người lớn (VND)</label>
                <input type="text" value={priceAdultStr} onChange={e => handlePriceAdultChange(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Giá trẻ em (VND)</label>
                <input type="text" value={priceChildStr} onChange={e => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setPriceChildStr(raw ? Number(raw).toLocaleString('vi-VN') : '');
                }} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Số chỗ tối đa</label>
                <input type="number" value={maxSeats} onChange={e => setMaxSeats(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" />
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
                Làm mới
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-8">
              <div>
                <MultiSelectDropdown
                  label="Loại hình Du lịch"
                  placeholder="Tìm và chọn loại hình..."
                  options={metadata.tourTypes?.map((t: any) => ({ id: t.id, label: t.name })) || []}
                  selectedIds={selectedTypes}
                  onChange={(ids) => setSelectedTypes(ids as number[])}
                />
              </div>
              <div>
                <MultiSelectDropdown
                  label="Dịp lễ / Sự kiện"
                  placeholder="Tìm và chọn dịp lễ..."
                  options={metadata.occasions?.map((o: any) => ({ id: o.id, label: o.name })) || []}
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
                    <input type="file" id="mainImageInput" className="hidden" accept="image/*" onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setMainImage({ preview: URL.createObjectURL(e.target.files[0]), file: e.target.files[0] })
                      }
                    }} />
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
                <input type="file" id="galleryImageInput" className="hidden" accept="image/*" multiple onChange={(e) => {
                  if (e.target.files) {
                    const newImages = Array.from(e.target.files).map((file: any) => ({ preview: URL.createObjectURL(file), file }))
                    setGalleryImages(prev => [...prev, ...newImages])
                  }
                }} />

                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-2">
                    {galleryImages.map((img, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden aspect-video border border-slate-700 group">
                        <img src={img.preview} alt="Gallery" className="w-full h-full object-cover" />
                        <button onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))} className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-black/60 hover:bg-red-600 text-white rounded backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* KHỐI 6: Lịch trình (Itinerary) */}
          <section className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#1e293b]/50 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-white">Khối 6: Lịch trình (Itinerary)</h2>
            </div>
            <div className="p-6 space-y-4">
              {itinerary.map((day, index) => (
                <div key={day.id} className="p-5 border border-slate-700 bg-[#0f172a] rounded-xl relative group">
                  <button onClick={() => setItinerary(itinerary.filter(i => i.id !== day.id))} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-slate-400 mb-2">Đánh dấu (Ngày/Đêm)</label>
                      <input value={day.day || ''} onChange={e => setItinerary(itinerary.map(i => i.id === day.id ? { ...i, day: e.target.value } : i))} placeholder="VD: Ngày 1" className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-white outline-none" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-400 mb-2">Tiêu đề hoạt động</label>
                      <input value={day.title} onChange={e => setItinerary(itinerary.map(i => i.id === day.id ? { ...i, title: e.target.value } : i))} placeholder="VD: Hà Nội - Hạ Long" className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-white outline-none" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Hoạt động chi tiết</label>
                    <RichTextEditor value={day.description} onChange={val => setItinerary(itinerary.map(i => i.id === day.id ? { ...i, description: val } : i))} placeholder="Mô tả các hoạt động trong ngày..." />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Ảnh minh họa</label>
                    <div 
                      onClick={() => document.getElementById(`itineraryImageInput-${day.id}`)?.click()}
                      className="w-full h-40 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-500 hover:bg-[#1e293b] transition-all relative"
                    >
                      {day.image ? (
                        <>
                          <img src={day.image} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">Thay đổi ảnh</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-500 flex flex-col items-center gap-2 group-hover:text-blue-400">
                          <ImageIcon className="w-8 h-8" />
                          <span className="text-sm font-medium">Click để tải ảnh lên</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      id={`itineraryImageInput-${day.id}`} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setItinerary(itinerary.map(i => i.id === day.id ? { ...i, image: reader.result as string } : i));
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </div>
                </div>
              ))}
              <button onClick={() => setItinerary([...itinerary, { id: Date.now(), day: `Ngày ${itinerary.length + 1}`, title: '', description: '', meals: [], image: '' }])} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 hover:bg-[#0f172a] transition-all flex items-center justify-center gap-2 font-medium">
                <Plus className="w-5 h-5" /> Thêm Ngày Mới
              </button>
            </div>
          </section>

          {/* KHỐI 7: Những thông tin cần lưu ý */}
          <section className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#1e293b]/50 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Khối 7: Những thông tin cần lưu ý</h2>
            </div>
            <div className="p-6 space-y-4">
              {notes.map((note, index) => (
                <div key={note.id} className="p-5 border border-slate-700 bg-[#0f172a] rounded-xl relative group">
                  <button onClick={() => setNotes(notes.filter(n => n.id !== note.id))} className="absolute top-4 right-4 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Tiêu đề lưu ý {index + 1}</label>
                    <input value={note.title} onChange={e => setNotes(notes.map(n => n.id === note.id ? { ...n, title: e.target.value } : n))} placeholder="VD: Thông tin Visa" className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Nội dung chi tiết</label>
                    <RichTextEditor value={note.content} onChange={val => setNotes(notes.map(n => n.id === note.id ? { ...n, content: val } : n))} placeholder="Viết các lưu ý..." />
                  </div>
                </div>
              ))}
              <button onClick={() => setNotes([...notes, { id: Date.now(), title: '', content: '' }])} className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-slate-500 hover:bg-[#0f172a] transition-all flex items-center justify-center gap-2 font-medium">
                <Plus className="w-5 h-5" /> Thêm Lưu Ý Mới
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
