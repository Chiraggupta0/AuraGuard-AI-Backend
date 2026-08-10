const express = require('express');
const roomController = require('./room.controller');
const validate = require('../../middlewares/validate.middleware');
const authenticateFirebaseUser = require('../../middlewares/firebase-auth.middleware');
const { generateTokenSchema, createRoomSchema, joinRoomSchema } = require('./room.validator');

const router = express.Router();

// Public endpoint (legacy, for backward compatibility)
router.post('/token', validate(generateTokenSchema), roomController.generateToken);

// Firebase-authenticated endpoints
router.post('/create', authenticateFirebaseUser, validate(createRoomSchema), roomController.createRoom);
router.post('/join', authenticateFirebaseUser, validate(joinRoomSchema), roomController.joinRoom);
router.get('/validate/:roomCode', authenticateFirebaseUser, roomController.validateRoom);

module.exports = router;
