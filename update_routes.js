const fs = require('fs');
let code = fs.readFileSync('backend/routes/tourRoutes.js', 'utf-8');

if (!code.includes('getMetadata')) {
    code = code.replace(
        /const \{ getTours, getTourById, seedData, createTour, updateTour, deleteTour \} = require\('\.\.\/controllers\/tourController'\);/,
        "const { getTours, getTourById, seedData, createTour, updateTour, deleteTour, getMetadata, createDestination, updateDestination, deleteDestination } = require('../controllers/tourController');\nconst { getHierarchy } = require('../controllers/locationController');"
    );
}

if (!code.includes('/metadata')) {
    code = code.replace(/module\.exports = router;(\s*)$/, ''); 
    code += `
// Location / Destination routes (Hybrid V1.5)
router.get('/metadata', getMetadata);
router.get('/locations/hierarchy', getHierarchy);
router.post('/destinations', verifyToken, verifyAdmin, createDestination);
router.put('/destinations/:id', verifyToken, verifyAdmin, updateDestination);
router.delete('/destinations/:id', verifyToken, verifyAdmin, deleteDestination);

module.exports = router;
`;
}

fs.writeFileSync('backend/routes/tourRoutes.js', code);
