import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

const destinations = [
  {
    id: 1,
    name: 'Sapa',
    region: 'Tây Bắc, Việt Nam',
    image: '/images/destinations/sapa.png',
    description: 'Thị trấn trong sương với ruộng bậc thang tuyệt đẹp.'
  },
  {
    id: 2,
    name: 'Đà Nẵng',
    region: 'Miền Trung, Việt Nam',
    image: '/images/destinations/danang.png',
    description: 'Thành phố đáng sống với biển xanh và cầu Vàng.'
  },
  {
    id: 3,
    name: 'Phú Quốc',
    region: 'Miền Nam, Việt Nam',
    image: '/images/destinations/phuquoc.png',
    description: 'Đảo ngọc hoang sơ cùng những bãi cát trắng mịn màng.'
  },
  {
    id: 4,
    name: 'Nhật Bản',
    region: 'Quốc tế',
    image: '/images/destinations/japan.png',
    description: 'Xứ sở anh đào giao thoa hoàn hảo giữa văn hóa truyền thống thiêng liêng và công nghệ hiện đại đột phá.'
  }
]

export default function PopularDestinations() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Khám phá điểm đến</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px]">
          {destinations.map((dest) => (
            <Link 
              key={dest.id} 
              href={`/tours?destination=${encodeURIComponent(dest.name === 'Sapa' ? 'Lào Cai' : dest.name)}`}
              className="group rounded-xl overflow-hidden relative aspect-[3/4] block shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors duration-300 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
              
              <Image 
                src={dest.image}
                alt={dest.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center gap-1.5 text-blue-300 text-sm font-medium mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <MapPin className="w-4 h-4" />
                  {dest.region}
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{dest.name}</h3>
                <p className="text-sm text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-3">
                  {dest.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
