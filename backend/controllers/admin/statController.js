const { pool } = require('../../config/db');
const ExcelJS = require('exceljs');

const getAdminStats = async (req, res) => {
    try {
        const { time } = req.query; // 'today', 'week', 'month', 'year', 'all'
        
        let dateCond = "";
        let prevDateCond = "";
        let params = [];
        let prevParams = [];
        
        let cumulDateCond = "";
        let cumulParams = [];
        let prevCumulDateCond = "";
        let prevCumulParams = [];
        
        let isTrend = false;
        
        if (time && time !== 'all') {
            const now = new Date();
            let startDate, endDate, prevStartDate, prevEndDate;
            
            if (time === 'today') {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                prevStartDate = new Date(startDate); prevStartDate.setDate(prevStartDate.getDate() - 1);
                prevEndDate = new Date(endDate); prevEndDate.setDate(prevEndDate.getDate() - 1);
            } else if (time === 'week') {
                const day = now.getDay() === 0 ? 7 : now.getDay();
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - day), 23, 59, 59, 999);
                prevStartDate = new Date(startDate); prevStartDate.setDate(prevStartDate.getDate() - 7);
                prevEndDate = new Date(endDate); prevEndDate.setDate(prevEndDate.getDate() - 7);
            } else if (time === 'month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            } else if (time === 'year') {
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
                prevEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
            }
            
            if (startDate && endDate) {
                dateCond = " AND created_at >= ? AND created_at <= ?";
                params = [startDate, endDate];
                
                cumulDateCond = " AND created_at <= ?";
                cumulParams = [endDate];
                
                prevDateCond = " AND created_at >= ? AND created_at <= ?";
                prevParams = [prevStartDate, prevEndDate];
                
                prevCumulDateCond = " AND created_at <= ?";
                prevCumulParams = [prevEndDate];
                
                isTrend = true;
            }
        }
        
        const [revRows] = await pool.query("SELECT COALESCE(SUM(total_price), 0) as val FROM bookings WHERE status IN ('Đã xác nhận', 'Đã hoàn thành')" + dateCond, params);
        const [bookRows] = await pool.query("SELECT COUNT(*) as val FROM bookings WHERE 1=1" + dateCond, params);
        const [tourRows] = await pool.query("SELECT COUNT(*) as val FROM tours WHERE 1=1" + cumulDateCond, cumulParams);
        const [pendRows] = await pool.query("SELECT COUNT(*) as val FROM bookings WHERE status = 'Đang chờ xác nhận'" + dateCond, params);
        const [userRows] = await pool.query("SELECT COUNT(*) as val FROM users WHERE role != 'admin'" + cumulDateCond, cumulParams);

        let kpiTrends = null;
        if (isTrend) {
            const [pRevRows] = await pool.query("SELECT COALESCE(SUM(total_price), 0) as val FROM bookings WHERE status IN ('Đã xác nhận', 'Đã hoàn thành')" + prevDateCond, prevParams);
            const [pBookRows] = await pool.query("SELECT COUNT(*) as val FROM bookings WHERE 1=1" + prevDateCond, prevParams);
            const [pTourRows] = await pool.query("SELECT COUNT(*) as val FROM tours WHERE 1=1" + prevCumulDateCond, prevCumulParams);
            const [pPendRows] = await pool.query("SELECT COUNT(*) as val FROM bookings WHERE status = 'Đang chờ xác nhận'" + prevDateCond, prevParams);
            const [pUserRows] = await pool.query("SELECT COUNT(*) as val FROM users WHERE role != 'admin'" + prevCumulDateCond, prevCumulParams);
            
            const calcPerc = (curr, prev) => {
                const curVal = Number(curr) || 0;
                const prevVal = Number(prev) || 0;
                if (prevVal === 0) return curVal > 0 ? 100 : 0;
                return Number((((curVal - prevVal) / prevVal) * 100).toFixed(1));
            };
            
            kpiTrends = {
                total_revenue: calcPerc(revRows[0].val, pRevRows[0].val),
                total_bookings: calcPerc(bookRows[0].val, pBookRows[0].val),
                active_tours: calcPerc(tourRows[0].val, pTourRows[0].val),
                pending_bookings: calcPerc(pendRows[0].val, pPendRows[0].val),
                total_users: calcPerc(userRows[0].val, pUserRows[0].val)
            };
        }

        // Doanh thu theo tháng (những đơn đã xác nhận hoặc hoàn thành)
        const [monthRows] = await pool.query(`
            SELECT DATE_FORMAT(departure_date, '%m/%Y') as month, 
                   COALESCE(SUM(total_price), 0) as revenue,
                   COUNT(*) as bookings_count
            FROM bookings 
            WHERE status IN ('Đã xác nhận', 'Đã hoàn thành')
            GROUP BY month 
            ORDER BY MIN(departure_date) ASC 
            LIMIT 12
        `);

        // Phân loại đơn đặt tour theo khu vực dựa trên cấu trúc chuẩn của DB
        const [regionRows] = await pool.query(`
            SELECT 
                COALESCE(c.name, 'Chưa phân loại') as calc_category,
                COALESCE(r.name, 'Chưa phân loại') as region_name,
                COUNT(b.id) as count
            FROM bookings b
            JOIN tours t ON b.tour_id = t.id
            LEFT JOIN Tour_Destination td ON t.id = td.tour_id AND td.is_primary = TRUE
            LEFT JOIN destination d ON td.destination_id = d.id
            LEFT JOIN country co ON d.country_id = co.id
            LEFT JOIN region r ON r.id = COALESCE(d.region_id, co.region_id)
            LEFT JOIN tourcategory c ON r.category_id = c.id
            WHERE b.status != 'Đã hủy'
            GROUP BY calc_category, region_name
        `);

        // Phương thức thanh toán phổ biến (Chỉ hiển thị Thanh toán trực tiếp và Thanh toán qua VNPay)
        const [payRows] = await pool.query(`
            SELECT 
                CASE 
                    WHEN payment_method LIKE '%VNPay%' THEN 'Thanh toán qua VNPay'
                    ELSE 'Thanh toán trực tiếp'
                END as method, 
                COUNT(*) as count 
            FROM bookings 
            GROUP BY method
        `);

        // Sức chứa tour và số chỗ đã đặt (Top tours được đặt nhiều nhất)
        const [spotsRows] = await pool.query(`
            SELECT t.id, t.name, COALESCE(t.available_spots, 30) as available_spots, 
                   COALESCE(SUM(CASE WHEN b.status != 'Đã hủy' THEN (b.adults + b.children) ELSE 0 END), 0) as booked_spots,
                   (SELECT d.name FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS location,
                   (SELECT r.name FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id JOIN region r ON r.id = COALESCE(d.region_id, co.region_id) WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS region
            FROM tours t
            LEFT JOIN bookings b ON t.id = b.tour_id
            GROUP BY t.id, t.name, t.available_spots
            ORDER BY booked_spots DESC, t.id ASC
            LIMIT 10
        `);

        // Danh sách đơn chờ xác nhận
        const [pendingList] = await pool.query(`
            SELECT b.id, b.user_name, b.tour_name, b.total_price, b.status 
            FROM bookings b 
            WHERE b.status = 'Đang chờ xác nhận' OR b.status = 'pending' OR b.status = 'Chờ xử lý' 
            ORDER BY b.created_at DESC 
            LIMIT 5
        `);

        res.json({
            kpi: {
                total_revenue: revRows[0].val,
                total_bookings: bookRows[0].val,
                active_tours: tourRows[0].val,
                pending_bookings: pendRows[0].val,
                total_users: userRows[0].val
            },
            kpi_trends: kpiTrends,
            monthly_analytics: monthRows,
            region_analytics: regionRows,
            payment_analytics: payRows,
            capacity_analytics: spotsRows,
            pending_bookings_list: pendingList
        });
    } catch (error) {
        console.error("Lỗi lấy dữ liệu thống kê Admin:", error.message);
        res.status(500).json({ message: "Lỗi máy chủ khi truy xuất thống kê" });
    }
};

const exportDashboardExcel = async (req, res) => {
    try {
        // 1. Lấy dữ liệu KPI
        const [revRows] = await pool.query("SELECT COALESCE(SUM(total_price), 0) as total_revenue FROM bookings WHERE status IN ('Đã xác nhận', 'Đã hoàn thành')");
        const [bookRows] = await pool.query("SELECT COUNT(*) as total_bookings FROM bookings");
        const [tourRows] = await pool.query("SELECT COUNT(*) as active_tours FROM tours");
        const [userRows] = await pool.query("SELECT COUNT(*) as total_users FROM users WHERE role != 'admin'");
        
        // 2. Lấy dữ liệu khu vực (Bảng 1)
        const [regionRows] = await pool.query(`
            SELECT 
                COALESCE(r.name, 'Chưa phân loại') as region_name,
                COUNT(b.id) as count
            FROM bookings b
            JOIN tours t ON b.tour_id = t.id
            LEFT JOIN Tour_Destination td ON t.id = td.tour_id AND td.is_primary = TRUE
            LEFT JOIN destination d ON td.destination_id = d.id
            LEFT JOIN country co ON d.country_id = co.id
            LEFT JOIN region r ON r.id = COALESCE(d.region_id, co.region_id)
            WHERE b.status != 'Đã hủy'
            GROUP BY region_name
            ORDER BY count DESC
        `);

        // 3. Lấy dữ liệu Top 5 Tour (Bảng 2)
        const [topTours] = await pool.query(`
            SELECT 
                t.name as tour_name,
                COALESCE(SUM(b.total_price), 0) as total_revenue
            FROM bookings b
            JOIN tours t ON b.tour_id = t.id
            WHERE b.status IN ('Đã xác nhận', 'Đã hoàn thành')
            GROUP BY t.id, t.name
            ORDER BY total_revenue DESC
            LIMIT 5
        `);

        // Khởi tạo Workbook và Worksheet
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Admin Dashboard';
        workbook.created = new Date();
        const worksheet = workbook.addWorksheet('Báo Cáo Tổng Quan');

        // Định dạng chung cột
        worksheet.columns = [
            { width: 5 },  // A - khoảng trống/padding
            { width: 45 }, // B - Tiêu đề
            { width: 25 }, // C - Giá trị
            { width: 25 }  // D - Phụ thêm
        ];

        // --- TITLE ---
        worksheet.mergeCells('B2:D2');
        const titleCell = worksheet.getCell('B2');
        titleCell.value = 'BÁO CÁO TỔNG QUAN HỆ THỐNG';
        titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        // --- PHẦN 1: KPI ---
        worksheet.mergeCells('B4:D4');
        const kpiTitle = worksheet.getCell('B4');
        kpiTitle.value = 'PHẦN 1: CÁC CHỈ SỐ CỐT LÕI (KPIs)';
        kpiTitle.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF1F4E78' } };
        kpiTitle.border = { bottom: { style: 'thick', color: { argb: 'FF1F4E78' } } };

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        worksheet.getCell('B6').value = 'Kỳ báo cáo:';
        worksheet.getCell('B6').font = { bold: true };
        worksheet.getCell('C6').value = `Tháng ${currentMonth}/${currentYear}`;

        worksheet.getCell('B7').value = 'Tổng doanh thu:';
        worksheet.getCell('B7').font = { bold: true };
        worksheet.getCell('C7').value = `${Number(revRows[0].total_revenue).toLocaleString('vi-VN')} VNĐ`;

        worksheet.getCell('B8').value = 'Tổng lượt đặt:';
        worksheet.getCell('B8').font = { bold: true };
        worksheet.getCell('C8').value = `${bookRows[0].total_bookings} lượt`;

        worksheet.getCell('B9').value = 'Người dùng hệ thống:';
        worksheet.getCell('B9').font = { bold: true };
        worksheet.getCell('C9').value = `${userRows[0].total_users} người`;

        worksheet.getCell('B10').value = 'Tour đang hoạt động:';
        worksheet.getCell('B10').font = { bold: true };
        worksheet.getCell('C10').value = `${tourRows[0].active_tours} tour`;

        // --- PHẦN 2: ANALYSIS ---
        worksheet.mergeCells('B13:D13');
        const analysisTitle = worksheet.getCell('B13');
        analysisTitle.value = 'PHẦN 2: PHÂN TÍCH DỮ LIỆU TỔNG QUAN';
        analysisTitle.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF1F4E78' } };
        analysisTitle.border = { bottom: { style: 'thick', color: { argb: 'FF1F4E78' } } };

        // BẢNG 1
        worksheet.mergeCells('B15:C15');
        const table1Title = worksheet.getCell('B15');
        table1Title.value = 'Bảng 1 - Lượt đặt theo khu vực';
        table1Title.font = { bold: true, italic: true };
        
        // Header Bảng 1
        worksheet.getCell('B16').value = 'Khu vực';
        worksheet.getCell('C16').value = 'Số lượt đặt';
        worksheet.getCell('D16').value = 'Tỷ trọng (%)';
        ['B16', 'C16', 'D16'].forEach(cell => {
            worksheet.getCell(cell).font = { bold: true };
            worksheet.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
            worksheet.getCell(cell).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        });

        let totalRegionBookings = regionRows.reduce((sum, r) => sum + r.count, 0);
        let currentRow = 17;
        regionRows.forEach(row => {
            worksheet.getCell(`B${currentRow}`).value = row.region_name;
            worksheet.getCell(`C${currentRow}`).value = row.count;
            
            let percent = totalRegionBookings > 0 ? ((row.count / totalRegionBookings) * 100).toFixed(1) : 0;
            worksheet.getCell(`D${currentRow}`).value = `${percent}%`;

            ['B', 'C', 'D'].forEach(col => {
                worksheet.getCell(`${col}${currentRow}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            });
            currentRow++;
        });

        currentRow += 2; // Khoảng cách

        // BẢNG 2
        worksheet.mergeCells(`B${currentRow}:C${currentRow}`);
        const table2Title = worksheet.getCell(`B${currentRow}`);
        table2Title.value = 'Bảng 2 - Top 5 Tour doanh thu cao nhất';
        table2Title.font = { bold: true, italic: true };
        currentRow++;

        worksheet.getCell(`B${currentRow}`).value = 'Tên Tour';
        worksheet.getCell(`C${currentRow}`).value = 'Doanh thu (VNĐ)';
        worksheet.mergeCells(`C${currentRow}:D${currentRow}`);
        
        ['B', 'C', 'D'].forEach(col => {
            worksheet.getCell(`${col}${currentRow}`).font = { bold: true };
            worksheet.getCell(`${col}${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
            worksheet.getCell(`${col}${currentRow}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        });
        currentRow++;

        topTours.forEach(row => {
            worksheet.getCell(`B${currentRow}`).value = row.tour_name;
            worksheet.getCell(`C${currentRow}`).value = Number(row.total_revenue).toLocaleString('vi-VN');
            worksheet.mergeCells(`C${currentRow}:D${currentRow}`);

            ['B', 'C', 'D'].forEach(col => {
                worksheet.getCell(`${col}${currentRow}`).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
            });
            currentRow++;
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=" + "Bao_Cao_Tong_Quan.xlsx"
        );

        await workbook.xlsx.write(res);
        res.status(200).end();

    } catch (error) {
        console.error("Lỗi xuất Excel:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi xuất báo cáo" });
    }
};

module.exports = {
    getAdminStats,
    exportDashboardExcel
};
