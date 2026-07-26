const fs = require('fs');
let code = fs.readFileSync('src/app/admin/tours/create/page.tsx', 'utf-8');

// Use string replacement to avoid regex issues
code = code.replace(
    '  // Metadata state\n  const [metadata, setMetadata] = useState<Metadata>({ tourTypes: [], occasions: [] })\n  const [hierarchy, setHierarchy] = useState<Category[]>([])\n\n  // Form states\n  const [categoryId, setCategoryId] = useState<string>(\'\')\n  const [regionId, setRegionId] = useState<string>(\'\')\n  const [destinationId, setDestinationId] = useState<string>(\'\')',
    '  const [category, setCategory] = useState(\'Trong nước\')\n  const [region, setRegion] = useState(\'Miền Bắc\')\n  const [location, setLocation] = useState(\'\')'
);

const loadMetaStart = code.indexOf('  const loadMetadata = async () => {');
const loadMetaEnd = code.indexOf('  // Khối 5: Upload Ảnh');
if (loadMetaStart !== -1 && loadMetaEnd !== -1) {
    code = code.substring(0, loadMetaStart) + code.substring(loadMetaEnd);
}

const tagStart = code.indexOf('  const [selectedTypes, setSelectedTypes] = useState<number[]>([])');
const tagEnd = code.indexOf('  const [mainImage, setMainImage]');
if (tagStart !== -1 && tagEnd !== -1) {
    code = code.substring(0, tagStart) + code.substring(tagEnd);
}

const toggleTagStart = code.indexOf('  // Khối 4: Logic Tags');
const toggleTagEnd = code.indexOf('  const handleSave = async () => {');
if (toggleTagStart !== -1 && toggleTagEnd !== -1) {
    code = code.substring(0, toggleTagStart) + code.substring(toggleTagEnd);
}

const handleSaveStart = code.indexOf('  const handleSave = async () => {');
const handleSaveEnd = code.indexOf('  const calculateEndDate = () => {');
if (handleSaveStart !== -1 && handleSaveEnd !== -1) {
    code = code.substring(0, handleSaveStart) + `  const handleSave = async () => {
    if (!title.trim()) { alert("Vui lòng nhập Tên Tour!"); return; }
    if (!priceAdult) { alert("Vui lòng nhập Giá người lớn!"); return; }
    if (!mainImage) { alert("Vui lòng tải lên Ảnh đại diện!"); return; }
    
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', title)
      formData.append('location', location)
      formData.append('region', region)
      formData.append('category', category)
      formData.append('price', priceAdult)
      formData.append('child_price', priceChild || '0')
      formData.append('available_spots', maxSeats || '30')
      formData.append('departure_date', startDate)
      formData.append('duration', \`\${days} Ngày \${nights} Đêm\`)
      formData.append('description', description)
      formData.append('badge', 'Mới')
      formData.append('itinerary', JSON.stringify(itinerary))

      if (mainImage?.file) {
        formData.append('image', mainImage.file)
      }
      
      galleryImages.forEach((img) => {
        if (img.file) formData.append('gallery', img.file)
      })

      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/tours', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${token}\`
        },
        body: formData
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

` + code.substring(handleSaveEnd);
}

const block1Start = code.indexOf('          {/* KHỐI 1: Phân loại & Vị trí */}');
const block1End = code.indexOf('          {/* KHỐI 2: Thông tin cốt lõi */}');
if (block1Start !== -1 && block1End !== -1) {
    code = code.substring(0, block1Start) + `          {/* KHỐI 1: Phân loại & Vị trí */}
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

` + code.substring(block1End);
}

const block4Start = code.indexOf('          {/* KHỐI 4: Gắn nhãn (Tagging) */}');
const block4End = code.indexOf('          {/* KHỐI 5: Tải lên Ảnh */}');
if (block4Start !== -1 && block4End !== -1) {
    code = code.substring(0, block4Start) + code.substring(block4End);
}

fs.writeFileSync('src/app/admin/tours/create/page.tsx', code);
