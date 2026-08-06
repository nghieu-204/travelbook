const express = require('express');
const router = express.Router();
const { chatWithAI, getChatHistory } = require('../../controllers/user/chatController');

router.post('/chat', chatWithAI);
router.get('/chat/:sessionId', getChatHistory);

module.exports = router;
