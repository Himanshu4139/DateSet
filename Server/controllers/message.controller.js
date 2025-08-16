const Message = require('../models/Message');
const User = require('../models/user');

// Get chat messages with another user (using cookie token for auth)
exports.getMessages = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = User.verifyToken(token);
    const currentUserId = decoded.id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Save a new message (text or file)
exports.sendMessage = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = User.verifyToken(token);
    const currentUserId = decoded.id;
    const { to, content, file } = req.body;

    const message = new Message({
      sender: currentUserId,
      receiver: to,
      content: content || '',
      file: file || undefined
    });

    await message.save();
    res.status(200).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Edit a message
exports.editMessage = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = User.verifyToken(token);
    const currentUserId = decoded.id;
    const messageId = req.params.id;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (String(message.sender) !== String(currentUserId))
      return res.status(403).json({ error: 'Not allowed to edit this message' });

    message.content = content;
    await message.save();

    res.status(200).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit message' });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = User.verifyToken(token);
    const currentUserId = decoded.id;
    const messageId = req.params.id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (String(message.sender) !== String(currentUserId))
      return res.status(403).json({ error: 'Not allowed to delete this message' });

    await message.deleteOne();

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// Delete all messages between current user and another user
exports.deleteConversation = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const decoded = User.verifyToken(token);
    const currentUserId = decoded.id;
    const otherUserId = req.params.userId;

    await Message.deleteMany({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    });

    res.status(200).json({ success: true, message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};
