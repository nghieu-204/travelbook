const express = require('express');
const router = express.Router();
const { chatWithAI, getChatHistory } = require('./chat.controller');

router.post('/chat', chatWithAI);
router.get('/chat/:sessionId', getChatHistory);

module.exports = router;
