const fs = require('fs');
let code = fs.readFileSync('backend/controllers/tourController.js', 'utf-8');

// Update createTour
code = code.replace(
    /const \{ name, location, region, price, original_price, child_price, available_spots, departure_date, duration, category, image, gallery, badge, description, itinerary, included, excluded \} = req\.body;/,
    'const { name, location, region, price, original_price, child_price, available_spots, departure_date, duration, category, image, gallery, badge, description, itinerary, included, excluded, destination_id } = req.body;'
);

code = code.replace(
    /INSERT INTO tours \(name, location, region, price, original_price, child_price, available_spots, departure_date, duration, category, image, gallery, badge, description, itinerary, included, excluded\)/,
    'INSERT INTO tours (name, location, region, price, original_price, child_price, available_spots, departure_date, duration, category, image, gallery, badge, description, itinerary, included, excluded, destination_id)'
);

code = code.replace(
    /VALUES \(\?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?, \?\)/,
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

code = code.replace(
    /\[name, location, region \|\| 'Miền Nam', price, original_price \|\| Math\.round\(price \* 1\.2\), child_price \|\| Math\.round\(price \* 0\.7\), available_spots \|\| 30, departure_date \|\| '2026-08-15', duration, category, image, galleryJson, badge \|\| 'Mới', description, itineraryJson, includedJson, excludedJson\]/,
    "[name, location, region || 'Miền Nam', price, original_price || Math.round(price * 1.2), child_price || Math.round(price * 0.7), available_spots || 30, departure_date || '2026-08-15', duration, category, image, galleryJson, badge || 'Mới', description, itineraryJson, includedJson, excludedJson, destination_id || null]"
);

// Update updateTour
code = code.replace(
    /const \{ name, location, region, price, original_price, child_price, available_spots, departure_date, duration, category, image, gallery, badge, description, itinerary, included, excluded \} = req\.body;/g,
    'const { name, location, region, price, original_price, child_price, available_spots, departure_date, duration, category, image, gallery, badge, description, itinerary, included, excluded, destination_id } = req.body;'
);

code = code.replace(
    /UPDATE tours SET name=\?, location=\?, region=\?, price=\?, original_price=\?, child_price=\?, available_spots=\?, departure_date=\?, duration=\?, category=\?, image=\?, gallery=\?, badge=\?, description=\?, itinerary=\?, included=\?, excluded=\? WHERE id=\?/,
    'UPDATE tours SET name=?, location=?, region=?, price=?, original_price=?, child_price=?, available_spots=?, departure_date=?, duration=?, category=?, image=?, gallery=?, badge=?, description=?, itinerary=?, included=?, excluded=?, destination_id=? WHERE id=?'
);

code = code.replace(
    /\[name, location, region \|\| 'Miền Nam', price, original_price \|\| Math\.round\(price \* 1\.2\), child_price \|\| Math\.round\(price \* 0\.7\), available_spots \|\| 30, departure_date \|\| '2026-08-15', duration, category, image, galleryJson, badge \|\| 'Mới', description, itineraryJson, includedJson, excludedJson, id\]/g,
    "[name, location, region || 'Miền Nam', price, original_price || Math.round(price * 1.2), child_price || Math.round(price * 0.7), available_spots || 30, departure_date || '2026-08-15', duration, category, image, galleryJson, badge || 'Mới', description, itineraryJson, includedJson, excludedJson, destination_id || null, id]"
);

fs.writeFileSync('backend/controllers/tourController.js', code);
