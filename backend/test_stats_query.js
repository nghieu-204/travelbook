const {pool} = require('./config/db'); 
async function test() {
    try {
        const [regionRows] = await pool.query(`
            SELECT 
                COALESCE(c.name, 'Chưa phân loại') as calc_category,
                COALESCE(r.name, 'Chưa phân loại') as region_name,
                COUNT(b.id) as count
            FROM bookings b
            JOIN tours t ON b.tour_id = t.id
            LEFT JOIN Tour_Destination td ON t.id = td.tour_id AND td.is_primary = TRUE
            LEFT JOIN destination d ON td.destination_id = d.id
            LEFT JOIN region r ON d.region_id = r.id
            LEFT JOIN tourcategory c ON r.category_id = c.id
            GROUP BY calc_category, region_name
        `);
        console.log("Region Query Success:", regionRows.length);
        
        const [spotsRows] = await pool.query(`
            SELECT t.id, t.name, COALESCE(t.available_spots, 30) as available_spots, 
                   COALESCE(SUM(CASE WHEN b.status != 'Hủy' THEN (b.adults + b.children) ELSE 0 END), 0) as booked_spots,
                   (SELECT d.name FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS location,
                   (SELECT r.name FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id JOIN region r ON d.region_id = r.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS region
            FROM tours t
            LEFT JOIN bookings b ON t.id = b.tour_id
            GROUP BY t.id, t.name, t.available_spots
            ORDER BY booked_spots DESC, t.id ASC
            LIMIT 10
        `);
        console.log("Spots Query Success:", spotsRows.length);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
test();
