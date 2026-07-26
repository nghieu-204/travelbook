const fs = require('fs');
const files = ['frontend/src/app/admin/tours/create/page.tsx', 'frontend/src/app/admin/tours/edit/[id]/page.tsx'];

const destinationMapCode = `
const destinationMap: Record<string, string[]> = {
  'Miền Bắc': ['Hà Nội', 'Sapa', 'Hạ Long', 'Ninh Bình', 'Hà Giang', 'Mộc Châu', 'Hải Phòng'],
  'Miền Trung': ['Đà Nẵng', 'Huế', 'Hội An', 'Nha Trang', 'Đà Lạt', 'Quy Nhơn', 'Phú Yên', 'Phong Nha'],
  'Miền Nam': ['TP. Hồ Chí Minh', 'Phú Quốc', 'Cần Thơ', 'Vũng Tàu', 'Tây Ninh', 'Côn Đảo'],
  'Châu Á': ['Nhật Bản', 'Hàn Quốc', 'Thái Lan', 'Singapore', 'Bali', 'Đài Loan', 'Trung Quốc', 'Malaysia', 'Indonesia'],
  'Châu Âu': ['Pháp', 'Ý', 'Thụy Sĩ', 'Hà Lan', 'Đức', 'Anh'],
  'Châu Mỹ': ['Mỹ', 'Canada', 'Brazil', 'Mexico'],
  'Châu Úc': ['Úc', 'New Zealand'],
  'Châu Phi': ['Nam Phi', 'Ai Cập', 'Kenya']
};
`;

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf-8');
  
  // Insert destinationMap after imports
  if (!code.includes('destinationMap')) {
    const importEnd = code.lastIndexOf('import ');
    const nextLineEnd = code.indexOf('\n', importEnd);
    code = code.substring(0, nextLineEnd + 1) + destinationMapCode + code.substring(nextLineEnd + 1);
  }

  // Change initial state for create/page.tsx
  if (file.includes('create')) {
    code = code.replace(/const \[category, setCategory\] = useState\('Trong nước'\)/g, "const [category, setCategory] = useState('')");
    code = code.replace(/const \[region, setRegion\] = useState\('Miền Bắc'\)/g, "const [region, setRegion] = useState('')");
  }

  // Change initial state fallback for edit/[id]/page.tsx
  if (file.includes('edit')) {
    code = code.replace(/setCategory\(data\.category \|\| 'Trong nước'\)/g, "setCategory(data.category || '')");
    code = code.replace(/setRegion\(data\.region \|\| 'Miền Bắc'\)/g, "setRegion(data.region || '')");
  }

  // Replace Khối 1 grid
  const gridStartRegex = /<div className="p-6 grid grid-cols-3 gap-6">[\s\S]*?<\/div>\s*<\/section>/;
  
  const newGrid = `<div className="p-6 grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Loại Tour</label>
                <select 
                  value={category} 
                  onChange={e => {
                    const newCategory = e.target.value;
                    setCategory(newCategory);
                    setRegion('');
                    setLocation('');
                  }} 
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" disabled>Chọn loại tour...</option>
                  <option value="Trong nước">Trong nước</option>
                  <option value="Quốc tế">Quốc tế</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Vùng miền</label>
                <select 
                  value={region} 
                  onChange={e => {
                    setRegion(e.target.value);
                    setLocation('');
                  }} 
                  disabled={!category}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>Chọn vùng miền...</option>
                  {category === 'Trong nước' && (
                    <>
                      <option value="Miền Bắc">Miền Bắc</option>
                      <option value="Miền Trung">Miền Trung</option>
                      <option value="Miền Nam">Miền Nam</option>
                    </>
                  )}
                  {category === 'Quốc tế' && (
                    <>
                      <option value="Châu Á">Châu Á</option>
                      <option value="Châu Âu">Châu Âu</option>
                      <option value="Châu Mỹ">Châu Mỹ</option>
                      <option value="Châu Úc">Châu Úc</option>
                      <option value="Châu Phi">Châu Phi</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Điểm đến (Tỉnh/Thành)</label>
                <select 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  disabled={!region}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>Chọn điểm đến...</option>
                  {region && destinationMap[region]?.map(dest => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>`;

  code = code.replace(gridStartRegex, newGrid);
  
  fs.writeFileSync(file, code);
});
