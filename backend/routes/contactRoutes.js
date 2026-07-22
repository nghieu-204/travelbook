const express = require('express');
const router = express.Router();
const { createContact, getAllContacts, replyContact } = require('../controllers/contactController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// Public route
router.post('/contacts', createContact);

// Admin protected routes
router.get('/contacts', verifyToken, verifyAdmin, getAllContacts);
router.put('/contacts/:id/reply', verifyToken, verifyAdmin, replyContact);

module.exports = router;
