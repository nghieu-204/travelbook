const express = require('express');
const router = express.Router();
const { createContact } = require('./contact.user.controller');
const { getAllContacts, replyContact } = require('./contact.admin.controller');
const { verifyAdmin } = require('../../middlewares/adminAuth');
const { verifyToken } = require('../../middlewares/userAuth');

// -- User Routes --
router.post('/contacts', createContact);

// -- Admin Routes --
router.get('/admin/contacts', verifyToken, verifyAdmin, getAllContacts);
router.put('/admin/contacts/:id/reply', verifyToken, verifyAdmin, replyContact);

module.exports = router;
