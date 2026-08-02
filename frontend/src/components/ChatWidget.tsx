'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, User } from 'lucide-react'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{ sender_type: string; message: string }[]>([])
  const [inputMsg, setInputMsg] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100)
    }
  }, [messages])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMsg.trim()) return
    
    // Thêm tin nhắn của user vào danh sách
    const newUserMsg = { sender_type: 'user', message: inputMsg }
    setMessages(prev => [...prev, newUserMsg])
    setInputMsg('')

    // Mô phỏng tự động trả lời (Mock UI)
    setTimeout(() => {
      const mockAdminMsg = { 
        sender_type: 'admin', 
        message: 'Cảm ơn bạn đã liên hệ. Hiện tại tính năng chat đang trong quá trình hoàn thiện giao diện. Nhân viên hỗ trợ sẽ sớm có mặt!' 
      }
      setMessages(prev => [...prev, mockAdminMsg])
    }, 1000)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div className={`absolute bottom-0 right-0 w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all origin-bottom-right ${isOpen ? 'scale-100 opacity-100 h-[450px]' : 'scale-0 opacity-0 h-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Hỗ trợ trực tuyến</h3>
              <p className="text-xs text-blue-100">Chúng tôi sẵn sàng giúp đỡ bạn</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
          <div className="text-center text-xs text-slate-400 my-4">Bắt đầu cuộc trò chuyện</div>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender_type === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'}`}>
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input 
            type="text" 
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Nhập tin nhắn..." 
            className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <button type="submit" disabled={!inputMsg.trim()} className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-full flex items-center justify-center flex-shrink-0 transition-colors">
            <Send className="w-4 h-4 ml-1" />
          </button>
        </form>
      </div>
    </div>
  )
}
