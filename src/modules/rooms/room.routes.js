const express = require('express');
const roomController = require('./room.controller');
const admissionController = require('./admission.controller');
const violationEngineController = require('../meetingSafety/violationEngine.controller');
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

// Host admission ("knock to enter") — REST fallback/reconciliation for the
// live '/admission' socket namespace (src/sockets/admission.socket.js).
router.get('/:roomCode/join-requests', authenticateFirebaseUser, admissionController.listPending);
router.get('/:roomCode/join-requests/:requestId', authenticateFirebaseUser, admissionController.getStatus);
router.post('/:roomCode/join-requests/:requestId/admit', authenticateFirebaseUser, admissionController.admit);
router.post('/:roomCode/join-requests/:requestId/reject', authenticateFirebaseUser, admissionController.reject);

// Violation Engine — REST fallback/reconciliation for the live '/violations'
// socket namespace (src/sockets/violationEngine.socket.js). Mute/remove are
// REST-only (no socket event) since they call out to the LiveKit Server SDK.
router.get('/:roomCode/violations', authenticateFirebaseUser, violationEngineController.listActive);
router.post('/:roomCode/violations/:violationId/dismiss', authenticateFirebaseUser, violationEngineController.dismiss);
router.post('/:roomCode/violations/:violationId/mute', authenticateFirebaseUser, violationEngineController.mute);
router.post('/:roomCode/violations/:violationId/remove', authenticateFirebaseUser, violationEngineController.remove);

module.exports = router;
