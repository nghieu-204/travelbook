'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, CheckCircle2, XCircle, Mail, MessageSquare, Send } from 'lucide-react'
import { fetchApi } from '@/lib/api'

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const data = await fetchApi('/contacts')
      setContacts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const filteredContacts = contacts.filter(c => 
    c.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenReply = (contact: any) => {
    setSelectedContact(contact)
    setReplyText(contact.admin_reply || '')
    setViewModalOpen(true)
  }

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      alert('Vui lòng nhập nội dung phản hồi!')
      return
    }
    
    setIsSubmitting(true)
    try {
      await fetchApi(`/contacts/${selectedContact.id}/reply`, {
        method: 'PUT',
        body: JSON.stringify({ admin_reply: replyText })
      })
      alert('Đã gửi phản hồi thành công qua Email!')
      setViewModalOpen(false)
      fetchContacts() // Refresh data
    } catch (err) {
      alert('Có lỗi xảy ra khi phản hồi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'Đã phản hồi') {
      return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[11px] font-bold">Đã phản hồi</span>
    }
    return <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[11px] font-bold">Chưa phản hồi</span>
  }

  return (
    <div className="p-8 pb-20 max-w-full mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Quản lý Liên hệ</h1>
        <p className="text-slate-400 text-sm">Quản lý và phản hồi các tin nhắn, yêu cầu hỗ trợ từ người dùng qua form Liên hệ.</p>
      </div>

      {/* Main Container */}
      <div className="bg-[#1e293b] rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0f172a] border border-slate-700 text-slate-200 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full transition-colors"
              placeholder="Tìm kiếm liên hệ..."
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full custom-scrollbar min-h-[350px]">
          <table className="w-full text-sm text-left text-slate-300 border-collapse">
            <thead className="text-[11px] text-slate-400 uppercase bg-[#0f172a] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold min-w-[200px]">Khách hàng</th>
                <th className="px-4 py-3 font-semibold min-w-[200px]">Chủ đề</th>
                <th className="px-4 py-3 font-semibold text-center">Ngày gửi</th>
                <th className="px-4 py-3 font-semibold text-center">Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-center sticky right-0 bg-[#0f172a] shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.3)] z-20">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-500 font-medium">Đang tải dữ liệu...</td></tr>
              ) : filteredContacts.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-500 font-medium">Không tìm thấy liên hệ nào.</td></tr>
              ) : (
                filteredContacts.map((contact, idx) => (
                  <tr key={contact.id} className={`border-b border-slate-800/50 hover:bg-slate-700/50 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-[#0f172a]/40'}`}>
                    <td className="px-4 py-3 border-r border-slate-800/50">
                      <div className="font-bold text-white text-[13px]">{contact.user_name}</div>
                      <div className="text-slate-400 text-xs mt-1 flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.user_email}</div>
                    </td>
                    <td className="px-4 py-3 border-r border-slate-800/50 font-medium text-slate-200">
                      {contact.subject}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-slate-800/50 text-xs text-slate-400">
                      {new Date(contact.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-center border-r border-slate-800/50">
                      {getStatusBadge(contact.status)}
                    </td>
                    <td className="px-4 py-3 text-center sticky right-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.3)] bg-inherit z-10">
                      <button 
                        onClick={() => handleOpenReply(contact)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md shadow-sm transition-colors flex items-center gap-1.5 mx-auto"
                      >
                        <MessageSquare className="w-3 h-3" /> 
                        {contact.status === 'Đã phản hồi' ? 'Xem lại' : 'Phản hồi'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reply Modal */}
      {viewModalOpen && selectedContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl w-full max-w-3xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                Nội dung Liên hệ
              </h3>
              <button onClick={() => setViewModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><XCircle className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* Thông tin khách hàng */}
              <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800">
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div><span className="text-slate-500 block mb-1">Khách hàng</span><strong className="text-white text-base">{selectedContact.user_name}</strong></div>
                  <div><span className="text-slate-500 block mb-1">Email</span><strong className="text-blue-400">{selectedContact.user_email}</strong></div>
                  <div className="col-span-2"><span className="text-slate-500 block mb-1">Chủ đề</span><strong className="text-white text-base">{selectedContact.subject}</strong></div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-2 text-sm">Nội dung tin nhắn:</span>
                  <div className="bg-[#0f172a] p-4 rounded-lg text-slate-300 italic border-l-4 border-slate-600 leading-relaxed whitespace-pre-wrap">
                    "{selectedContact.message}"
                  </div>
                </div>
              </div>

              {/* Khung phản hồi */}
              <div className="space-y-3">
                <label className="font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-500" /> 
                  Soạn phản hồi qua Email
                </label>
                {selectedContact.status === 'Đã phản hồi' ? (
                  <div className="bg-emerald-500/10 p-5 rounded-xl border border-emerald-500/20 text-emerald-400 whitespace-pre-wrap">
                    {selectedContact.admin_reply}
                  </div>
                ) : (
                  <textarea
                    className="w-full h-40 bg-[#0f172a] border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all placeholder:text-slate-600"
                    placeholder="Nhập nội dung phản hồi. Hệ thống sẽ tự động đóng gói nội dung này thành thư và gửi thẳng tới hộp thư của khách hàng..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  ></textarea>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 shrink-0 bg-slate-900/50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => setViewModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
              {selectedContact.status !== 'Đã phản hồi' && (
                <button 
                  onClick={handleSendReply}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <><Send className="w-4 h-4" /> Gửi phản hồi Email</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
