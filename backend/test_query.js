const {pool} = require('./config/db'); 
pool.query(`SELECT t.id, (SELECT CONCAT('[', GROUP_CONCAT(JSON_OBJECT('id', d.id, 'name', d.name, 'is_primary', td.is_primary)), ']') FROM Tour_Destination td JOIN destination d ON td.destination_id = d.id WHERE td.tour_id = t.id) AS destinations FROM tours t LIMIT 1`)
.then(([rows]) => { console.log(rows); process.exit(0); })
.catch(e => { console.error(e.message); process.exit(1); })
