const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post('/register',userController.register);
router.post('/login',userController.login);

//Google Auth 
router.post('/google-auth',userController.googleAuth);

module.exports = router;