const path = require('path');
const Message = require('../models/Message');

// For demo, using in-memory message store here, replace with DB in prod
const messages = {};

// Get chat messages with another user
exports.getMessages = (req, res) => {
  const currentUserId = req.headers.authorization?.split(' ')[1]; // simple token-based auth
  if (!currentUserId) return res.status(401).json({ message: 'Unauthorized' });

  const otherUserId = req.params.userId;
  const convoId = [currentUserId, otherUserId].sort().join('-');

  const convoMessages = messages[convoId] || [];
  res.json(convoMessages);
};

// Handle file upload
exports.uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const { sender, receiver, content } = req.body;

    if (!file || !receiver || !sender) {
      return res.status(400).json({ message: 'File, sender, and receiver are required' });
    }

    // file.path is the Cloudinary URL after upload
    const newMessage = new Message({
      sender,
      receiver,
      content: content || '',
      file: file.path,  // save Cloudinary URL here
      createdAt: new Date(),
      read: false,
    });

    await newMessage.save();

    res.status(200).json({ message: 'File uploaded successfully', fileUrl: file.path, newMessage });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  const { senderId, receiverId } = req.query;

  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
