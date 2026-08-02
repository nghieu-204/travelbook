const express = require('express');
const router = express.Router();
const { createContact } = require('../../controllers/user/contactController');

router.post('/contacts', createContact);

module.exports = router;
