const fs = require('fs');

function updateCreatePage() {
    let code = fs.readFileSync('frontend/src/app/admin/tours/create/page.tsx', 'utf-8');

    // Remove hardcoded destinationMap
    const destinationMapStr = `const destinationMap: Record<string, string[]> = {
  'Miền Bắc': ['Hà Nội', 'Sapa', 'Hạ Long', 'Ninh Bình', 'Hà Giang', 'Mộc Châu', 'Hải Phòng'],
  'Miền Trung': ['Đà Nẵng', 'Huế', 'Hội An', 'Nha Trang', 'Đà Lạt', 'Quy Nhơn', 'Phú Yên', 'Phong Nha'],
  'Miền Nam': ['TP. Hồ Chí Minh', 'Phú Quốc', 'Cần Thơ', 'Vũng Tàu', 'Tây Ninh', 'Côn Đảo'],
  'Châu Á': ['Nhật Bản', 'Hàn Quốc', 'Thái Lan', 'Singapore', 'Bali', 'Đài Loan', 'Trung Quốc', 'Malaysia', 'Indonesia'],
  'Châu Âu': ['Pháp', 'Ý', 'Thụy Sĩ', 'Hà Lan', 'Đức', 'Anh'],
  'Châu Mỹ': ['Mỹ', 'Canada', 'Brazil', 'Mexico'],
  'Châu Úc': ['Úc', 'New Zealand'],
  'Châu Phi': ['Nam Phi', 'Ai Cập', 'Kenya']
};\n`;
    code = code.replace(destinationMapStr, '');

    // Add state for metadata and destination_id
    const stateRegex = /const \[category, setCategory\] = useState\(''\)/;
    code = code.replace(stateRegex, `const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const data = await fetchApi('/metadata');
        setCategories(data.categories || []);
        setRegions(data.regions || []);
        setDestinations(data.destinations || []);
      } catch (err) {
        console.error('Lỗi tải metadata', err);
      }
    };
    fetchMeta();
  }, []);

  const [category, setCategory] = useState('')`);

    const locationStateRegex = /const \[location, setLocation\] = useState\(''\)/;
    code = code.replace(locationStateRegex, `const [location, setLocation] = useState('')\n  const [destinationId, setDestinationId] = useState<number | ''>('')`);

    // Update Khối 1
    const khoi1Regex = /<section className="bg-\[#1e293b\] rounded-2xl border border-slate-800">[\s\S]*?<\/section>/;
    const newKhoi1 = `<section className="bg-[#1e293b] rounded-2xl border border-slate-800">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#1e293b]/50 flex items-center gap-2 rounded-t-2xl">
              <Map className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-white">Khối 1: Phân loại & Vị trí</h2>
            </div>
            <div className="p-6 grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Loại Tour</label>
                <select 
                  value={category} 
                  onChange={e => {
                    setCategory(e.target.value);
                    setRegion('');
                    setLocation('');
                    setDestinationId('');
                  }} 
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" disabled>Chọn loại tour...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Vùng miền</label>
                <select 
                  value={region} 
                  onChange={e => {
                    setRegion(e.target.value);
                    setLocation('');
                    setDestinationId('');
                  }} 
                  disabled={!category}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>Chọn vùng miền...</option>
                  {regions.filter(r => r.category_id === categories.find(c => c.name === category)?.id).map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Điểm đến (Tỉnh/Thành)</label>
                <select 
                  value={destinationId} 
                  onChange={e => {
                    setDestinationId(parseInt(e.target.value));
                    setLocation(e.target.options[e.target.selectedIndex].text);
                  }} 
                  disabled={!region}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>Chọn điểm đến...</option>
                  {destinations.filter(d => d.region_id === regions.find(r => r.name === region)?.id).map(dest => (
                    <option key={dest.id} value={dest.id}>{dest.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>`;
    code = code.replace(khoi1Regex, newKhoi1);

    // Add category_id, region_id to types
    code = code.replace(/type Region = \{ id: number; name: string; destinations: Destination\[\]; \};/g, 'type Region = { id: number; name: string; category_id: number; destinations: Destination[]; };');
    code = code.replace(/type Destination = \{ id: number; name: string; \};/g, 'type Destination = { id: number; name: string; region_id: number; };');

    // Update handleSave
    code = code.replace(/category: category,/g, 'category: category,\n        destination_id: destinationId || null,');

    fs.writeFileSync('frontend/src/app/admin/tours/create/page.tsx', code);
}

function updateEditPage() {
    let code = fs.readFileSync('frontend/src/app/admin/tours/edit/[id]/page.tsx', 'utf-8');

    // Remove hardcoded destinationMap
    const destinationMapStr = `const destinationMap: Record<string, string[]> = {
  'Miền Bắc': ['Hà Nội', 'Sapa', 'Hạ Long', 'Ninh Bình', 'Hà Giang', 'Mộc Châu', 'Hải Phòng'],
  'Miền Trung': ['Đà Nẵng', 'Huế', 'Hội An', 'Nha Trang', 'Đà Lạt', 'Quy Nhơn', 'Phú Yên', 'Phong Nha'],
  'Miền Nam': ['TP. Hồ Chí Minh', 'Phú Quốc', 'Cần Thơ', 'Vũng Tàu', 'Tây Ninh', 'Côn Đảo'],
  'Châu Á': ['Nhật Bản', 'Hàn Quốc', 'Thái Lan', 'Singapore', 'Bali', 'Đài Loan', 'Trung Quốc', 'Malaysia', 'Indonesia'],
  'Châu Âu': ['Pháp', 'Ý', 'Thụy瑞士', 'Hà Lan', 'Đức', 'Anh'], // Wait, edit page might have typo or slightly different
`;
    // Just regex it out
    code = code.replace(/const destinationMap: Record<string, string\[\]> = \{[\s\S]*?\};\n/g, '');

    // Add state for metadata and destination_id
    const stateRegex = /const \[category, setCategory\] = useState\(''\)/;
    code = code.replace(stateRegex, `const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const data = await fetchApi('/metadata');
        setCategories(data.categories || []);
        setRegions(data.regions || []);
        setDestinations(data.destinations || []);
      } catch (err) {
        console.error('Lỗi tải metadata', err);
      }
    };
    fetchMeta();
  }, []);

  const [category, setCategory] = useState('')`);

    const locationStateRegex = /const \[location, setLocation\] = useState\(''\)/;
    code = code.replace(locationStateRegex, `const [location, setLocation] = useState('')\n  const [destinationId, setDestinationId] = useState<number | ''>('')`);

    // Fetch Tour setDestinationId
    code = code.replace(/setLocation\(data\.location \|\| ''\)/, `setLocation(data.location || '');\n          setDestinationId(data.destination_id || '');`);

    // Update Khối 1
    const khoi1Regex = /<section className="bg-\[#1e293b\] rounded-2xl border border-slate-800">[\s\S]*?<\/section>/;
    const newKhoi1 = `<section className="bg-[#1e293b] rounded-2xl border border-slate-800">
            <div className="px-6 py-4 border-b border-slate-800 bg-[#1e293b]/50 flex items-center gap-2 rounded-t-2xl">
              <Map className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-white">Khối 1: Phân loại & Vị trí</h2>
            </div>
            <div className="p-6 grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Loại Tour</label>
                <select 
                  value={category} 
                  onChange={e => {
                    setCategory(e.target.value);
                    setRegion('');
                    setLocation('');
                    setDestinationId('');
                  }} 
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" disabled>Chọn loại tour...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Vùng miền</label>
                <select 
                  value={region} 
                  onChange={e => {
                    setRegion(e.target.value);
                    setLocation('');
                    setDestinationId('');
                  }} 
                  disabled={!category}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>Chọn vùng miền...</option>
                  {regions.filter(r => r.category_id === categories.find(c => c.name === category)?.id).map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Điểm đến (Tỉnh/Thành)</label>
                <select 
                  value={destinationId} 
                  onChange={e => {
                    setDestinationId(parseInt(e.target.value));
                    setLocation(e.target.options[e.target.selectedIndex].text);
                  }} 
                  disabled={!region}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>Chọn điểm đến...</option>
                  {destinations.filter(d => d.region_id === regions.find(r => r.name === region)?.id).map(dest => (
                    <option key={dest.id} value={dest.id}>{dest.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>`;
    code = code.replace(khoi1Regex, newKhoi1);

    // Add category_id, region_id to types
    code = code.replace(/type Region = \{ id: number; name: string; destinations: Destination\[\]; \};/g, 'type Region = { id: number; name: string; category_id: number; destinations: Destination[]; };');
    code = code.replace(/type Destination = \{ id: number; name: string; \};/g, 'type Destination = { id: number; name: string; region_id: number; };');

    // Update handleSave
    code = code.replace(/category: category,/g, 'category: category,\n        destination_id: destinationId || null,');

    fs.writeFileSync('frontend/src/app/admin/tours/edit/[id]/page.tsx', code);
}

try {
    updateCreatePage();
    updateEditPage();
    console.log("Updated both pages");
} catch(e) {
    console.error(e);
}
