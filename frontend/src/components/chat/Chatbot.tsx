'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuthStore } from '@/store/useAuthStore';

import { usePathname } from 'next/navigation';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export default function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([{
    role: 'model',
    content: 'Chào bạn! Tôi là trợ lý ảo của TravelBook. Bạn cần tìm tour du lịch nào?'
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuthStore();

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  // Load session from localStorage on mount (ONLY IF LOGGED IN)
  useEffect(() => {
    // Reset chat state when user changes
    setSessionId(null);
    setHistory([{
      role: 'model',
      content: 'Chào bạn! Tôi là trợ lý ảo của TravelBook. Bạn cần tìm tour du lịch nào?'
    }]);

    if (!user) return; // Không tải lịch sử nếu chưa đăng nhập
    
    let interval: NodeJS.Timeout;
    const savedSessionId = localStorage.getItem(`chat_session_${user.id}`);
    
    const loadHistory = () => {
      if (!savedSessionId) return;
      
      setSessionId(savedSessionId);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/chat/${savedSessionId}`)
        .then(res => res.json())
        .then(data => {
           if (data.success && data.history && data.history.length > 0) {
             const loadedHistory: ChatMessage[] = data.history.map((msg: any) => ({
               role: msg.sender_type === 'USER' ? 'user' : 'model',
               content: msg.content
             }));
             setHistory(loadedHistory);
             
             // Nếu tin nhắn cuối cùng là của Khách (User), chứng tỏ Server đang gửi gọi AI
             // Ta sẽ tự động thử lấy lại lịch sử sau 3 giây (Polling)
             if (loadedHistory[loadedHistory.length - 1].role === 'user') {
               setIsLoading(true);
               interval = setTimeout(loadHistory, 3000);
             } else {
               setIsLoading(false);
             }
           }
        })
        .catch(console.error);
    };

    loadHistory();

    return () => clearTimeout(interval);
  }, [user]); // Re-run when user changes (login/logout)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMsg = message.trim();
    setMessage('');
    
    // Add user message to history immediately
    const newHistory: ChatMessage[] = [...history, { role: 'user', content: userMsg }];
    setHistory(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8902/api'}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg,
          sessionId: sessionId,
          userId: user?.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setHistory(prev => [...prev, { role: 'model', content: data.reply }]);
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
          if (user) {
            localStorage.setItem(`chat_session_${user.id}`, data.sessionId);
          }
        }
      } else {
        setHistory(prev => [...prev, { role: 'model', content: `Xin lỗi, có lỗi xảy ra: ${data.message}` }]);
      }
    } catch (error) {
      console.error(error);
      setHistory(prev => [...prev, { role: 'model', content: 'Xin lỗi, không thể kết nối tới server. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Do not render on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Nút bật/tắt Chatbot */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-blue-700 transition-all z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-110'}`}
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* Cửa sổ Chat */}
      <div 
        className={`fixed bottom-6 right-6 w-[360px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 border border-slate-200 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-blue-600 p-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">TravelBook AI</h3>
              <p className="text-blue-100 text-xs">Sẵn sàng tư vấn 24/7</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Chat */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
          {history.map((msg, index) => (
            <div key={index} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-white border border-slate-200 text-slate-500 shadow-sm'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm whitespace-pre-wrap' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm chat-markdown prose-sm [&>p]:mb-2 [&>ul]:pl-4 [&>ul]:list-disc [&>ul]:mb-2 [&>strong]:font-bold'}`}>
                {msg.role === 'model' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 max-w-[85%] self-start">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-xs text-slate-500 font-medium animate-pulse">AI đang phân tích...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Form nhập chat */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Nhắn tin cho TravelBook..."
            className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!message.trim() || isLoading}
            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4 ml-1" />
          </button>
        </form>
      </div>
    </>
  );
}
