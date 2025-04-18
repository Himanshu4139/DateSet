const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post('/register',userController.register);
router.post('/login',userController.login);
router.get('/getUser',userController.getUser);
router.put('/updateUser',userController.updateUser);
router.get('/allProfile',userController.allProfile);
router.post('/rightSwipe/:id',userController.rightSwipe);
router.post('/leftSwipe/:id',userController.leftSwipe);
router.get('/me/:id', userController.me);
router.get('/sendRequests',userController.sendRequests);
router.get('/receiveRequests',userController.receiveRequests);
router.get('/matches',userController.matches);
router.delete('/removeSentRequest/:id', userController.removeSentRequest);
router.put('/acceptRequest/:id',userController.acceptRequest);
router.delete('/denyRequest/:id', userController.denyRequest);

//Google Auth 
router.post('/google-auth',userController.googleAuth);

module.exports = router;