const { admin } = require('../config/firebase-admin');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

// Verifies Firebase ID token from Authorization header
const authenticateFirebaseUser = catchAsync(async (req, _res, next) => {
  const authHeader = req.headers.authorization;

  console.log('[AUTH BACKEND] Authorization header exists:', !!authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('[AUTH BACKEND] Missing or invalid authorization header');
    throw ApiError.unauthorized('Authentication token is missing');
  }

  const token = authHeader.split('Bearer ')[1];

  if (!token) {
    logger.warn('[AUTH BACKEND] Token not found after Bearer split');
    throw ApiError.unauthorized('Authentication token is missing');
  }

  console.log('[AUTH BACKEND] Bearer token exists: true');

  try {
    console.log('[AUTH BACKEND] Token verification started');

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    console.log('[AUTH BACKEND] Token verification successful');
    console.log('[AUTH BACKEND] Firebase UID:', decodedToken.uid);
    console.log('[AUTH BACKEND] User email:', decodedToken.email);

    logger.info('[AUTH BACKEND] Firebase user authenticated', {
      uid: decodedToken.uid,
      email: decodedToken.email,
    });

    // Attach decoded token and Firebase user info to request
    req.firebaseUser = decodedToken;
    req.user = {
      _id: decodedToken.uid, // Use Firebase UID as _id for compatibility
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0],
      isFirebaseUser: true,
    };

    next();
  } catch (error) {
    logger.error('[AUTH BACKEND] Firebase token verification failed', {
      error: error.message,
    });

    if (error.code === 'auth/id-token-expired') {
      throw ApiError.unauthorized('Authentication token has expired');
    } else if (error.code === 'auth/invalid-id-token') {
      throw ApiError.unauthorized('Invalid authentication token');
    } else {
      throw ApiError.unauthorized('Authentication token verification failed');
    }
  }
});

module.exports = authenticateFirebaseUser;
