const fs = require('fs');
let c = fs.readFileSync('controllers/user/tourController.js', 'utf8');

c = c.replace(
  "AS province",
  "AS province,\n                   (SELECT d.name FROM tour_destination td JOIN destination d ON td.destination_id = d.id WHERE td.tour_id = t.id AND td.is_primary = TRUE LIMIT 1) AS destination_name"
);

fs.writeFileSync('controllers/user/tourController.js', c);
console.log('patched2');
