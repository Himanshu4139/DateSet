const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const multer = require('multer');
const { parser } = require('../config/cloudinaryConfig');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.get('/', messageController.getMessages); //for prevent message loss realoading

router.get('/:userId', messageController.getMessages);

router.post('/upload', parser.single('file'), messageController.uploadFile);

module.exports = router;
