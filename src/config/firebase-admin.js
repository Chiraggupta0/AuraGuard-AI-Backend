const admin = require('firebase-admin');
const env = require('./env');
const logger = require('./logger');

// Initialize Firebase Admin SDK
let firebaseAdminApp;

try {
  // Firebase Admin SDK initialization
  // Requires one of:
  // 1. GOOGLE_APPLICATION_CREDENTIALS env var pointing to serviceAccountKey.json
  // 2. Application Default Credentials (running in Google Cloud)
  // 3. Custom initialization with service account

  if (!firebaseAdminApp) {
    // Initialize with just project ID
    // Firebase will look for GOOGLE_APPLICATION_CREDENTIALS env var automatically
    const options = {};

    if (env.firebaseProjectId) {
      options.projectId = env.firebaseProjectId;
    }

    firebaseAdminApp = admin.initializeApp(options);

    logger.info('[FIREBASE ADMIN] Initialized successfully');
    logger.info('[FIREBASE ADMIN] Project ID:', env.firebaseProjectId || 'Using default credentials');
    console.log('[FIREBASE ADMIN] Project ID:', env.firebaseProjectId || 'Using default credentials');
  }
} catch (error) {
  logger.error('[FIREBASE ADMIN] Initialization error:', {
    message: error.message,
    hint: 'Make sure GOOGLE_APPLICATION_CREDENTIALS env var points to your Firebase service account key, or set FIREBASE_PROJECT_ID',
  });
  throw error;
}

module.exports = {
  admin,
  firebaseAdminApp,
};
