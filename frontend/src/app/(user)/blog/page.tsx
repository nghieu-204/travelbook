import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'

const mockPosts = [
  { id: 1, title: 'Top 10 địa điểm du lịch không thể bỏ lỡ mùa hè 2026', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', date: '20/07/2026', author: 'TravelBlog', excerpt: 'Mùa hè đã đến, hãy cùng chúng tôi khám phá những điểm đến tuyệt vời nhất từ những bãi biển xanh ngắt đến những hòn đảo hoang sơ...' },
  { id: 2, title: 'Kinh nghiệm phượt Tây Bắc mùa lúa chín', image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80', date: '15/07/2026', author: 'Phượt thủ', excerpt: 'Tháng 9 về mang theo sắc vàng ươm của lúa chín trải dài trên những thửa ruộng bậc thang kỳ vĩ ở Mù Cang Chải, Sa Pa...' },
  { id: 3, title: 'Review chi tiết du thuyền 5 sao Vịnh Hạ Long', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80', date: '10/07/2026', author: 'Reviewer', excerpt: 'Trải nghiệm 2 ngày 1 đêm sống sang chảnh trên du thuyền giữa kỳ quan thiên nhiên thế giới, ẩm thực đỉnh cao và ngắm bình minh tuyệt đẹp...' },
]

export default function BlogPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">Cẩm Nang Du Lịch</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Cập nhật tin tức, kinh nghiệm và những bí kíp du lịch hữu ích nhất cho chuyến đi tiếp theo của bạn.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {mockPosts.map(post => (
            <div key={post.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow group">
              <div className="relative h-64 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {post.date}</span>
                  <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h2>
                <p className="text-slate-600 text-sm mb-6 line-clamp-3">{post.excerpt}</p>
                <Link href={`/blog/${post.id}`} className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Đọc tiếp <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
