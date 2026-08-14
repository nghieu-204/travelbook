const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'controllers/admin/statController.js');
let code = fs.readFileSync(file, 'utf8');

const oldCode =         const [revRows] = await pool.query("SELECT COALESCE(SUM(total_price), 0) as total_revenue FROM bookings WHERE status IN ('Đã xác nhận', 'Đã hoàn thành')");
        const [bookRows] = await pool.query("SELECT COUNT(*) as total_bookings FROM bookings");
        const [tourRows] = await pool.query("SELECT COUNT(*) as active_tours FROM tours");
        const [pendRows] = await pool.query("SELECT COUNT(*) as pending_bookings FROM bookings WHERE status = 'Đang chờ xác nhận'");
        const [userRows] = await pool.query("SELECT COUNT(*) as total_users FROM users WHERE role != 'admin'");;

const newCode =         const { time } = req.query; // 'today', 'week', 'month', 'year', 'all'
        
        let dateCond = "";
        let prevDateCond = "";
        let params = [];
        let prevParams = [];
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
                prevDateCond = " AND created_at >= ? AND created_at <= ?";
                prevParams = [prevStartDate, prevEndDate];
                isTrend = true;
            }
        }
        
        const [revRows] = await pool.query("SELECT COALESCE(SUM(total_price), 0) as val FROM bookings WHERE status IN ('Đã xác nhận', 'Đã hoàn thành')" + dateCond, params);
        const [bookRows] = await pool.query("SELECT COUNT(*) as val FROM bookings WHERE 1=1" + dateCond, params);
        const [tourRows] = await pool.query("SELECT COUNT(*) as val FROM tours WHERE 1=1" + dateCond, params);
        const [pendRows] = await pool.query("SELECT COUNT(*) as val FROM bookings WHERE status = 'Đang chờ xác nhận'" + dateCond, params);
        const [userRows] = await pool.query("SELECT COUNT(*) as val FROM users WHERE role != 'admin'" + dateCond, params);

        let kpiTrends = null;
        if (isTrend) {
            const [pRevRows] = await pool.query("SELECT COALESCE(SUM(total_price), 0) as val FROM bookings WHERE status IN ('Đã xác nhận', 'Đã hoàn thành')" + prevDateCond, prevParams);
            const [pBookRows] = await pool.query("SELECT COUNT(*) as val FROM bookings WHERE 1=1" + prevDateCond, prevParams);
            const [pTourRows] = await pool.query("SELECT COUNT(*) as val FROM tours WHERE 1=1" + prevDateCond, prevParams);
            const [pPendRows] = await pool.query("SELECT COUNT(*) as val FROM bookings WHERE status = 'Đang chờ xác nhận'" + prevDateCond, prevParams);
            const [pUserRows] = await pool.query("SELECT COUNT(*) as val FROM users WHERE role != 'admin'" + prevDateCond, prevParams);
            
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
        };

code = code.replace(oldCode, newCode);

const oldRes =         res.json({
            kpi: {
                total_revenue: revRows[0].total_revenue,
                total_bookings: bookRows[0].total_bookings,
                active_tours: tourRows[0].active_tours,
                pending_bookings: pendRows[0].pending_bookings,
                total_users: userRows[0].total_users
            },
            monthly_analytics: monthRows,;

const newRes =         res.json({
            kpi: {
                total_revenue: revRows[0].val,
                total_bookings: bookRows[0].val,
                active_tours: tourRows[0].val,
                pending_bookings: pendRows[0].val,
                total_users: userRows[0].val
            },
            kpi_trends: kpiTrends,
            monthly_analytics: monthRows,;

code = code.replace(oldRes, newRes);

fs.writeFileSync(file, code);
