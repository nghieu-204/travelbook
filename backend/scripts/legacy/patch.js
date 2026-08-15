const fs = require('fs');
let c = fs.readFileSync('controllers/user/tourController.js', 'utf8');

c = c.replace(
  "(SELECT c.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id JOIN region r ON COALESCE(d.region_id, co.region_id) = r.id JOIN tourcategory c ON r.category_id = c.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS category",
  "(SELECT c.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id LEFT JOIN country co ON d.country_id = co.id JOIN region r ON COALESCE(d.region_id, co.region_id) = r.id JOIN tourcategory c ON r.category_id = c.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS category,\n                   (SELECT co.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id JOIN country co ON d.country_id = co.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS province"
);

fs.writeFileSync('controllers/user/tourController.js', c);
console.log('patched');
