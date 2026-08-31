const { pool } = require('../../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../../utils/sendEmail');
const { BOOKING_STATUS, PAYMENT_STATUS, USER_ROLE, USER_STATUS } = require('../../config/constants');

// Admin: Lấy danh sách toàn bộ người dùng (có phân trang và tìm kiếm)
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const role = req.query.role || '';
        const status = req.query.status || '';
        const offset = (page - 1) * limit;

        let queryParams = [];
        let whereClauses = [];

        if (search) {
            whereClauses.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)');
            const searchPattern = `%${search}%`;
            queryParams.push(searchPattern, searchPattern, searchPattern);
        }
        if (role) {
            whereClauses.push('role = ?');
            queryParams.push(role);
        }
        if (status) {
            whereClauses.push('status = ?');
            queryParams.push(status);
        }

        const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Đếm tổng số user
        const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM users ${whereSQL}`, queryParams);
        const totalPages = Math.ceil(total / limit);

        // Lấy dữ liệu
        const dataQuery = `SELECT id, name, email, role, avatar, address, phone, status, is_active, created_at, google_id, facebook_id FROM users ${whereSQL} ORDER BY (role = '${USER_ROLE.ADMIN}') DESC, created_at DESC LIMIT ? OFFSET ?`;
        const [rows] = await pool.query(dataQuery, [...queryParams, limit, offset]);

        // Thêm trường auth_provider
        const mappedRows = rows.map(row => {
            let auth_provider = 'local';
            if (row.google_id) auth_provider = 'google';
            else if (row.facebook_id) auth_provider = 'facebook';

            // Xóa google_id, facebook_id khỏi response cho gọn
            delete row.google_id;
            delete row.facebook_id;

            return {
                ...row,
                auth_provider
            };
        });

        res.json({
            data: mappedRows,
            total,
            page,
            limit,
            totalPages
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách người dùng:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// Admin: Cập nhật trạng thái người dùng (Khóa / Mở khóa)
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Hoạt động' or 'Bị khóa'

        if (Number(id) === Number(req.user.id) && status !== USER_STATUS.ACTIVE) {
            return res.status(400).json({ message: "Bạn không thể tự khóa tài khoản của chính mình!" });
        }

        await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: `Đã cập nhật trạng thái người dùng #${id} thành ${status}` });
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái user:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// Admin: Reset Mật khẩu người dùng (Gửi link qua email)
const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Lấy email và kiểm tra OAuth
        const [[user]] = await pool.query('SELECT email, name, google_id, facebook_id FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        if (user.google_id || user.facebook_id) {
            const provider = user.google_id ? 'Google' : 'Facebook';
            return res.status(400).json({ message: `Tài khoản này đăng nhập thông qua ${provider} và không sử dụng mật khẩu của hệ thống TravelBook.` });
        }

        // 2. Tạo token ngẫu nhiên và thời hạn (15 phút)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

        // 3. Lưu vào DB
        await pool.query(
            'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
            [resetToken, resetExpires, id]
        );

        // 4. Gửi email
        const resetLink = `http://localhost:8900/reset-password?token=${resetToken}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">TravelBooking - Đặt lại mật khẩu</h2>
                <p>Xin chào <strong>${user.name}</strong>,</p>
                <p>Quản trị viên đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Để đặt lại mật khẩu, vui lòng click vào nút bên dưới (Link có hiệu lực trong 15 phút):</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Tạo mật khẩu mới</a>
                </div>
                <p>Hoặc copy link này dán vào trình duyệt: <br><a href="${resetLink}">${resetLink}</a></p>
                <p>Nếu bạn không có yêu cầu này, vui lòng bỏ qua email.</p>
                <p>Trân trọng,<br>Đội ngũ TravelBooking</p>
            </div>
        `;

        await sendEmail(user.email, "TravelBooking - Đặt lại mật khẩu", emailHtml);

        res.json({ message: "Đã gửi link đặt lại mật khẩu qua email cho người dùng." });
    } catch (error) {
        console.error("Lỗi reset mật khẩu:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// Admin: Lấy chi tiết Người dùng (Profile, Booking History, CRM Insights)
const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Lấy thông tin Profile cơ bản
        const [users] = await pool.query(
            'SELECT id, name, email, phone, address, role, status, avatar, created_at, google_id, facebook_id FROM users WHERE id = ?', 
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        const profile = users[0];
        if (profile.google_id) profile.auth_provider = 'google';
        else if (profile.facebook_id) profile.auth_provider = 'facebook';
        else profile.auth_provider = 'local';
        
        delete profile.google_id;
        delete profile.facebook_id;

        // 2. Lấy Lịch sử Booking (Dựa vào user_id hoặc user_email)
        const [bookings] = await pool.query(
            'SELECT id, tour_name, departure_date, adults, children, total_price, payment_status, status, created_at FROM bookings WHERE user_id = ? OR user_email = ? ORDER BY created_at DESC',
            [id, profile.email]
        );

        // 3. Tính toán CRM Insights
        let totalTours = 0;
        let totalSpent = 0;
        let totalCancelled = 0;

        bookings.forEach(booking => {
            // Tính các tour không bị hủy
            if (booking.status !== BOOKING_STATUS.CANCELLED) {
                totalTours += 1;
                // Có thể bạn muốn chỉ tính tiền khi thanh toán thành công, nhưng tạm tính tổng tiền các đơn không hủy
                if (booking.payment_status === PAYMENT_STATUS.PAID || booking.payment_status === 'Đã cọc') {
                    totalSpent += booking.total_price;
                }
            } else {
                totalCancelled += 1;
            }
        });

        const cancelRate = bookings.length > 0 
            ? ((totalCancelled / bookings.length) * 100).toFixed(1) 
            : 0;

        const insights = {
            totalTours,
            totalSpent,
            cancelRate: parseFloat(cancelRate)
        };

        res.json({
            profile,
            bookings,
            insights
        });

    } catch (error) {
        console.error("Lỗi lấy chi tiết người dùng:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

// Admin: Cập nhật thông tin chi tiết người dùng
const updateUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, address, role, status } = req.body;
        
        if (Number(id) === Number(req.user.id)) {
            if (role !== USER_ROLE.ADMIN) {
                return res.status(400).json({ message: "Bạn không thể tự hạ quyền của chính mình!" });
            }
            if (status !== USER_STATUS.ACTIVE) {
                return res.status(400).json({ message: "Bạn không thể tự khóa tài khoản của chính mình!" });
            }
        }

        if (role === USER_ROLE.ADMIN) {
            const [[targetUser]] = await pool.query('SELECT google_id, facebook_id FROM users WHERE id = ?', [id]);
            if (targetUser && (targetUser.google_id || targetUser.facebook_id)) {
                return res.status(400).json({ message: "Không thể cấp quyền Admin cho tài khoản đăng nhập bằng Google/Facebook!" });
            }
        }

        await pool.query(
            'UPDATE users SET name = ?, phone = ?, address = ?, role = ?, status = ? WHERE id = ?',
            [name, phone, address, role, status, id]
        );
        
        res.json({ message: `Đã cập nhật thông tin người dùng #${id} thành công` });
    } catch (error) {
        console.error("Lỗi cập nhật người dùng:", error.message);
        res.status(500).json({ message: "Lỗi hệ thống trong quá trình xử lý" });
    }
};

module.exports = {
    getAllUsers,
    updateUserStatus,
    resetUserPassword,
    getUserDetails,
    updateUserDetails
};
