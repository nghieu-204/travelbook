import React, { useState, useRef, useEffect } from 'react';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Xin chào! Tôi là trợ lý ảo của Travel N. Bạn cần hỗ trợ gì về tour du lịch?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    // Tự động cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Thêm tin nhắn của User
        const userMsg = { sender: 'user', text: inputValue };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');

        // Giả lập Bot trả lời sau 1 giây
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { sender: 'bot', text: 'Cảm ơn bạn đã liên hệ. Quản trị viên sẽ sớm trả lời câu hỏi của bạn!' }
            ]);
        }, 1000);
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, fontFamily: 'Inter, sans-serif' }}>
            
            {/* Cửa sổ Chat (chỉ hiển thị khi isOpen = true) */}
            {isOpen && (
                <div style={{ 
                    position: 'absolute', 
                    bottom: '70px', 
                    right: 0, 
                    width: '350px', 
                    height: '450px', 
                    background: 'white', 
                    borderRadius: '20px', 
                    boxShadow: '0 15px 40px rgba(0,0,0,0.15)', 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden',
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    {/* Header */}
                    <div style={{ background: 'linear-gradient(135deg, #0a66c2, #00d4bd)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 8px #4ade80' }}></div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Travel N Support</h3>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer', opacity: 0.8 }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{ 
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                background: msg.sender === 'user' ? '#0a66c2' : 'white',
                                color: msg.sender === 'user' ? 'white' : '#334155',
                                padding: '10px 14px',
                                borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                fontSize: '14px',
                                lineHeight: 1.5
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{ padding: '14px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            placeholder="Nhập tin nhắn..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                        />
                        <button 
                            type="submit" 
                            style={{ background: '#0a66c2', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            ➤
                        </button>
                    </form>
                </div>
            )}

            {/* Nút Floating Bubble */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #0a66c2, #00d4bd)', 
                    color: 'white', 
                    border: 'none', 
                    boxShadow: '0 8px 20px rgba(10,102,194,0.4)', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'scale(0.9)' : 'scale(1)'
                }}
            >
                {isOpen ? '×' : '💬'}
            </button>
            
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
}
