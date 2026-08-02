const express = require('express');
const router = express.Router();
const { getAllContacts, replyContact } = require('../../controllers/admin/contactController');
const { verifyAdmin } = require('../../middlewares/adminAuth');

router.get('/contacts', verifyAdmin, getAllContacts);
router.put('/contacts/:id/reply', verifyAdmin, replyContact);

module.exports = router;
