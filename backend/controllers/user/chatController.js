const OpenAI = require('openai');
const { pool } = require('../../config/db');
const crypto = require('crypto');

// Tự động phát hiện loại Key: OpenRouter (sk-or-v1-...) hoặc OpenAI thật (sk-proj-...)
const apiKey = process.env.OPENAI_API_KEY || 'MISSING_API_KEY';
const isOpenRouter = apiKey.startsWith('sk-or-');

const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined
});

const chatWithAI = async (req, res) => {
    try {
        let { message, sessionId, userId } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        // 1. Quản lý Session ID
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            await pool.query('INSERT INTO chat_sessions (id, user_id) VALUES (?, ?)', [sessionId, userId || null]);
        } else {
            // Kiểm tra xem session có tồn tại không, nếu không thì tạo lại (phòng hờ DB bị xóa)
            const [sessions] = await pool.query('SELECT id FROM chat_sessions WHERE id = ?', [sessionId]);
            if (sessions.length === 0) {
                await pool.query('INSERT INTO chat_sessions (id, user_id) VALUES (?, ?)', [sessionId, userId || null]);
            }
        }

        // 2. Lưu tin nhắn của Khách (USER) vào DB
        await pool.query('INSERT INTO chat_messages (session_id, sender_type, content) VALUES (?, ?, ?)', [sessionId, 'USER', message]);

        // 3. Mock mode nếu không có API Key hợp lệ
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-nhap-ma-openai-cua-ban-vao-day') {
            const mockReply = "Chào bạn, tôi là AI tư vấn (Hiện đang chạy ở chế độ mô phỏng vì hệ thống chưa được cấu hình OpenAI API Key). Bạn có muốn xem danh sách các tour miền Bắc không?";
            await pool.query('INSERT INTO chat_messages (session_id, sender_type, content) VALUES (?, ?, ?)', [sessionId, 'BOT', mockReply]);
            return res.status(200).json({ success: true, reply: mockReply, sessionId });
        }

        // 4. Chuẩn bị Context dữ liệu Tour
        const [tours] = await pool.query('SELECT id, name, price, duration FROM tours WHERE status = "Active" LIMIT 20');
        
        let tourContext = "Bạn là nhân viên tư vấn nhiệt tình của website du lịch TravelBook. Khi tư vấn tour cho khách:\n\n- CHỈ ĐƯỢC PHÉP SỬ DỤNG TIẾNG VIỆT CHUẨN. TUYỆT ĐỐI KHÔNG pha trộn tiếng Hàn, tiếng Trung, tiếng Nhật hay tiếng Anh vào câu trả lời.\n- Trình bày thông tin ngắn gọn, dễ đọc, luôn báo giá và thời lượng rõ ràng.\n- Tuyệt đối không hiển thị mã ID của tour ra màn hình. Tuy nhiên, khi bạn nhắc đến tên một Tour, BẮT BUỘC phải chèn một đường dẫn (link) Markdown có dạng: [Tên Tour](/tours/MÃ_ID_CỦA_TOUR). Ví dụ: [Tour Hà Nội](/tours/1)\n- Xưng hô 'mình' và gọi khách là 'bạn' một cách thân thiện.\n- Luôn kết thúc bằng một câu hỏi mở để dẫn dắt khách hàng xem thêm chi tiết hoặc chốt sale.\n\nDưới đây là thông tin về các tour hiện có:\n";
        tours.forEach(t => {
            tourContext += `- Tên tour: ${t.name} (Giá: ${t.price} VNĐ, Thời gian: ${t.duration}, Mã ID: ${t.id})\n`;
        });
        tourContext += "\nNếu khách hỏi tour không có trong danh sách trên, hãy bảo rằng hiện tại công ty có thể thiết kế tour riêng hoặc vui lòng liên hệ hotline.";

        // 5. Lấy Lịch sử Chat từ DB
        const [chatMessages] = await pool.query('SELECT sender_type, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC', [sessionId]);

        const messages = [
            { role: "system", content: tourContext }
        ];

        chatMessages.forEach(msg => {
            messages.push({
                role: msg.sender_type === 'USER' ? 'user' : 'assistant',
                content: msg.content
            });
        });

        // 6. Gọi API OpenAI / OpenRouter
        try {
            const completion = await openai.chat.completions.create({
                model: isOpenRouter ? "openrouter/free" : "gpt-4o-mini", 
                messages: messages,
            });

            const responseText = completion.choices[0].message.content;

            // 7. Lưu tin nhắn của AI (BOT) vào DB
            await pool.query('INSERT INTO chat_messages (session_id, sender_type, content) VALUES (?, ?, ?)', [sessionId, 'BOT', responseText]);

            res.status(200).json({
                success: true,
                reply: responseText,
                sessionId: sessionId
            });
        } catch (apiError) {
            console.error("Lỗi OpenAI API:", apiError.message);
            const errorReply = "Chào bạn, tôi là AI tư vấn (Hiện đang chạy ở chế độ mô phỏng vì OpenAI API Key của bạn chưa hợp lệ hoặc hết hạn). Bạn có muốn xem danh sách các tour miền Bắc không?";
            await pool.query('INSERT INTO chat_messages (session_id, sender_type, content) VALUES (?, ?, ?)', [sessionId, 'BOT', errorReply]);
            res.status(200).json({
                success: true,
                reply: errorReply,
                sessionId: sessionId
            });
        }
    } catch (error) {
        console.error("Lỗi Chatbot:", error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi gọi AI: ' + error.message });
    }
};

const getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) {
            return res.status(400).json({ success: false, message: 'Missing sessionId' });
        }
        
        const [messages] = await pool.query('SELECT sender_type, content FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC', [sessionId]);
        
        return res.status(200).json({
            success: true,
            history: messages
        });
    } catch (error) {
        console.error("Lỗi lấy lịch sử Chat:", error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = {
    chatWithAI,
    getChatHistory
};
