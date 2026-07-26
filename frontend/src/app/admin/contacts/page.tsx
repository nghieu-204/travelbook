'use client'

import { useState } from 'react'
import { Reply, CheckCircle, X, Send, Search } from 'lucide-react'

// Mock Data
const initialContacts = [
  {
    id: 'CT001',
    name: 'Nguyễn Văn Minh',
    email: 'minhnv@gmail.com',
    phone: '0912345678',
    date: '2023-11-20',
    content: 'Tôi muốn hỏi về thủ tục visa đi Nhật Bản vào tháng sau.',
    status: 'pending'
  },
  {
    id: 'CT002',
    name: 'Trần Lệ Xuân',
    email: 'xuan.tran@yahoo.com',
    phone: '0988111222',
    date: '2023-11-22',
    content: 'Có tour nào đi Đà Lạt phù hợp cho gia đình có con nhỏ không?',
    status: 'pending'
  },
  {
    id: 'CT003',
    name: 'Phạm Tuấn Anh',
    email: 'tuananhpham@outlook.com',
    phone: '0905555666',
    date: '2023-11-23',
    content: 'Cho tôi xin bảng giá tour Thái Lan 4N3Đ dịp Tết âm lịch.',
    status: 'pending'
  }
]

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState(initialContacts)
  const [replyModal, setReplyModal] = useState<any>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const handleReplySubmit = () => {
    setIsSending(true)
    // Simulate API call
    setTimeout(() => {
      setIsSending(false)
      setToastMessage('Đã phản hồi qua email thành công!')
      
      // Remove or mark as processed
      setContacts(contacts.filter(c => c.id !== replyModal.id))
      
      setReplyModal(null)
      setReplyContent('')
      
      setTimeout(() => setToastMessage(''), 3000)
    }, 2000)
  }

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[200] animate-in slide-in-from-top-4 fade-in duration-300">
          <CheckCircle className="w-6 h-6" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Quản lý Liên Hệ</h1>
          <p className="text-slate-400">Giải đáp thắc mắc và hỗ trợ khách hàng.</p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Tìm kiếm tên, email..." className="pl-10 pr-4 py-2 bg-[#1e293b] border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 w-64" />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0f172a] text-slate-400 text-sm border-b border-slate-800">
              <th className="p-4 font-semibold">Ngày gửi</th>
              <th className="p-4 font-semibold">Khách hàng</th>
              <th className="p-4 font-semibold">SĐT</th>
              <th className="p-4 font-semibold">Email</th>
              <th className="p-4 font-semibold w-1/3">Nội dung yêu cầu</th>
              <th className="p-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                  Không có yêu cầu liên hệ nào chờ xử lý.
                </td>
              </tr>
            ) : (
              contacts.map(contact => (
                <tr key={contact.id} className="border-b border-slate-800/50 hover:bg-[#0f172a]/50 transition-colors">
                  <td className="p-4 whitespace-nowrap">{contact.date}</td>
                  <td className="p-4 font-bold text-white">{contact.name}</td>
                  <td className="p-4 whitespace-nowrap">{contact.phone}</td>
                  <td className="p-4">{contact.email}</td>
                  <td className="p-4">
                    <p className="line-clamp-2 text-sm text-slate-400">{contact.content}</p>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setReplyModal(contact)}
                      className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 ml-auto shadow-lg shadow-blue-600/20"
                    >
                      <Reply className="w-4 h-4" /> Phản hồi
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reply Modal */}
      {(replyModal || false) && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Reply className="w-5 h-5 text-blue-500" />
                Phản hồi Khách hàng
              </h3>
              <button 
                onClick={() => setReplyModal(null)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
              {/* Left: Customer Context */}
              <div className="w-full md:w-5/12 border-r border-slate-800 pr-0 md:pr-8">
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Người gửi</h4>
                  <p className="font-bold text-white text-lg">{replyModal.name}</p>
                  <p className="text-slate-400 text-sm">{replyModal.email} • {replyModal.phone}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nội dung câu hỏi</h4>
                  <div className="bg-[#0f172a] p-4 rounded-xl text-slate-300 text-sm leading-relaxed border border-slate-800">
                    "{replyModal.content}"
                  </div>
                </div>
              </div>

              {/* Right: Reply Editor */}
              <div className="w-full md:w-7/12 flex flex-col">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Soạn câu trả lời</h4>
                <textarea 
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder="Xin chào bạn, tôi là admin..."
                  className="flex-1 w-full bg-[#0f172a] border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500 min-h-[200px] mb-6 resize-none"
                />
                
                <div className="flex justify-end gap-3">
                  <button 
                    onClick={() => setReplyModal(null)}
                    className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-[#334155] hover:text-white transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    onClick={handleReplySubmit}
                    disabled={isSending || !replyContent.trim()}
                    className="px-8 py-3 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-700 flex items-center gap-2 transition-colors min-w-[160px] justify-center shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Gửi Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
