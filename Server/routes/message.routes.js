const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');

// Get all messages between current user and another user
router.get('/:userId', messageController.getMessages);

// Send a new message (text or file)
router.post('/send', messageController.sendMessage);

// Edit a message
router.put('/:id', messageController.editMessage);

// Delete a message
router.delete('/:id', messageController.deleteMessage);

// Delete all messages between current user and another user
router.delete('/conversation/:userId', messageController.deleteConversation);

module.exports = router;
