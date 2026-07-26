const fs = require('fs');

let createCode = fs.readFileSync('frontend/src/app/admin/tours/create/page.tsx', 'utf-8');

// Replace component name
createCode = createCode.replace('export default function CreateTourV2() {', 'export default function EditTour() {\n  const params = useParams()\n  const tourId = params.id\n  const [isLoading, setIsLoading] = useState(true)\n');

// Replace imports
createCode = createCode.replace(`import { useState, useEffect } from 'react'\nimport { useRouter } from 'next/navigation'`, `import { useState, useEffect } from 'react'\nimport { useRouter, useParams } from 'next/navigation'`);

createCode = createCode.replace('Thêm Tour Mới (V2)', 'Sửa Tour');

// Add loadTour logic
const effectStart = createCode.indexOf('  // Khối 5: Upload Ảnh');
const loadLogic = `  useEffect(() => {
    const loadTour = async () => {
      try {
        const res = await fetch(\`http://localhost:5000/api/tours/\${tourId}\`)
        const data = await res.json()
        if (data) {
          setTitle(data.name || '')
          setDescription(data.description || '')
          setCategory(data.category || 'Trong nước')
          setRegion(data.region || 'Miền Bắc')
          setLocation(data.location || '')
          
          setPriceAdult(data.price ? String(data.price) : '')
          setPriceAdultStr(data.price ? Number(data.price).toLocaleString('vi-VN') : '')
          setPriceChild(data.child_price ? String(data.child_price) : '')
          setPriceChildStr(data.child_price ? Number(data.child_price).toLocaleString('vi-VN') : '')
          
          setMaxSeats(data.available_spots ? String(data.available_spots) : '30')
          
          if (data.departure_date) {
            try {
              setStartDate(new Date(data.departure_date).toISOString().split('T')[0])
            } catch (e) { setStartDate(data.departure_date) }
          }
          
          if (data.duration) {
            const match = data.duration.match(/(\\d+)\\s*Ngày\\s*(\\d+)\\s*Đêm/i)
            if (match) {
              setDays(match[1])
              setNights(match[2])
            }
          }
          
          if (data.image) {
            setMainImage({ preview: \`\${data.image.startsWith('http') ? '' : 'http://localhost:5000'}\${data.image}\` })
          }
          
          if (data.gallery) {
            try {
              const gallery = typeof data.gallery === 'string' ? JSON.parse(data.gallery) : data.gallery
              setGalleryImages(gallery.map(img => ({ preview: \`\${img.startsWith('http') ? '' : 'http://localhost:5000'}\${img}\` })))
            } catch(e) {}
          }
          
          if (data.itinerary) {
            try {
              const itin = typeof data.itinerary === 'string' ? JSON.parse(data.itinerary) : data.itinerary
              if (Array.isArray(itin) && itin.length > 0) {
                setItinerary(itin)
              }
            } catch(e) {}
          }
        }
      } catch (error) {
        console.error('Failed to load tour', error)
      } finally {
        setIsLoading(false)
      }
    }
    if (tourId) loadTour()
  }, [tourId])

`;

createCode = createCode.substring(0, effectStart) + loadLogic + createCode.substring(effectStart);

// Replace save endpoint to PUT
createCode = createCode.replace(/fetch\('http:\/\/localhost:5000\/api\/tours', \{[\s\S]*?method: 'POST'/, `fetch(\`http://localhost:5000/api/tours/\${tourId}\`, {
        method: 'PUT'`);
createCode = createCode.replace('Tạo Tour thành công!', 'Cập nhật Tour thành công!');
createCode = createCode.replace('Hoàn thành & Lưu', 'Lưu thay đổi');

// Replace top return with loading state
createCode = createCode.replace('  return (\n    <div className="flex flex-col h-full', `  if (isLoading) return <div className="p-8 text-white">Đang tải dữ liệu tour...</div>\n\n  return (\n    <div className="flex flex-col h-full`);

fs.writeFileSync('frontend/src/app/admin/tours/edit/[id]/page.tsx', createCode);
