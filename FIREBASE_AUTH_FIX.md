# Firebase Authentication Fix - Complete Setup Guide

## ROOT CAUSE IDENTIFIED ✅

The backend was using a **custom JWT middleware** that tried to verify Firebase tokens as if they were custom JWTs. This failed because:

1. ❌ **auth.middleware.js** called `verifyAccessToken()` (custom JWT verification)
2. ❌ Tried to look up user in MongoDB User collection
3. ❌ Firebase tokens cannot be verified this way

**Frontend was correctly sending Firebase ID tokens, but backend rejected them.**

---

## SOLUTION IMPLEMENTED ✅

Created a **Firebase authentication middleware** that:

1. ✅ Extracts Firebase ID token from `Authorization: Bearer {token}`
2. ✅ Verifies it using Firebase Admin SDK
3. ✅ Extracts Firebase UID and email
4. ✅ Attaches to `req.user` for controllers to use
5. ✅ No MongoDB User lookup required

---

## FILES CREATED

1. **src/config/firebase-admin.js** - Firebase Admin SDK initialization
2. **src/middlewares/firebase-auth.middleware.js** - Firebase token verification middleware

## FILES MODIFIED

1. **src/modules/rooms/room.routes.js** - Use Firebase middleware instead of custom JWT
2. **src/modules/rooms/room.controller.js** - Add debug logging
3. **src/config/env.js** - Add Firebase project ID config
4. **src/server.js** - Initialize Firebase Admin on startup
5. **package.json** - Add `firebase-admin` dependency
6. **.env** - Add Firebase configuration section
7. **.env.example** - Document Firebase setup

---

## SETUP INSTRUCTIONS

### Step 1: Install Firebase Admin SDK

```bash
cd AuraGuard-AI-Backend
npm install
```

This installs `firebase-admin` (newly added to package.json).

### Step 2: Get Firebase Service Account Key

1. Go to **Firebase Console**: https://console.firebase.google.com
2. Select your project (should be **auraguard-ai-e4c8e** or similar)
3. Click **⚙️ Settings** (gear icon) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file to your backend folder:
   ```
   AuraGuard-AI-Backend/auraguard-ai-firebase-adminsdk.json
   ```

### Step 3: Update .env File

Add to `.env`:

```env
FIREBASE_PROJECT_ID=auraguard-ai-e4c8e
GOOGLE_APPLICATION_CREDENTIALS=./auraguard-ai-firebase-adminsdk.json
```

**Important:** 
- Replace `auraguard-ai-e4c8e` with your actual Firebase project ID
- The path should be relative to where you run `npm run dev`

### Step 4: Verify Frontend Firebase Project ID

**Frontend** should use the same Firebase project.

Check: `Frontend/src/config/firebase.js` or similar

The Firebase project ID in frontend config should match backend `FIREBASE_PROJECT_ID`.

### Step 5: Restart Backend

```bash
# Kill existing server (Ctrl+C if running)
npm run dev
```

Expected startup logs:
```
[FIREBASE ADMIN] Initialized successfully
[FIREBASE ADMIN] Project ID: auraguard-ai-e4c8e
✓ Server is running on port 5000
✓ Connected to MongoDB
```

---

## TEST THE FIX

### Test Create Room (Should Work Now)

1. **Frontend:** Hard refresh (Ctrl+Shift+R)
2. **Login** with Firebase
3. **Create Room**

Expected console output:

**Frontend:**
```
[AUTH] User authenticated: {email: '...'}
[API] Firebase token added to request
[ROOM] Creating room...
[ROOM] Room created successfully: Aurora-ABC123
```

**Backend:**
```
[AUTH BACKEND] Authorization header exists: true
[AUTH BACKEND] Bearer token exists: true
[AUTH BACKEND] Token verification started
[AUTH BACKEND] Token verification successful
[AUTH BACKEND] Firebase UID: ...
[AUTH BACKEND] User email: ...
[ROOM] Creating room
[ROOM] Room created successfully
```

### Expected Result

✅ **201 Created** (not 401 Unauthorized)  
✅ Room code appears on screen  
✅ Console shows success messages  

---

## TROUBLESHOOTING

### Error: "Cannot find module 'firebase-admin'"

**Fix:**
```bash
npm install
```

Then restart:
```bash
npm run dev
```

### Error: "FIREBASE_PROJECT_ID is not set"

**Fix:** Add to `.env`:
```env
FIREBASE_PROJECT_ID=auraguard-ai-e4c8e
```

Then restart backend.

### Error: "GOOGLE_APPLICATION_CREDENTIALS file not found"

**Fix:** 
1. Download Firebase service account key (see Step 2 above)
2. Save to project root: `AuraGuard-AI-Backend/auraguard-ai-firebase-adminsdk.json`
3. Update `.env`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./auraguard-ai-firebase-adminsdk.json
   ```
4. Restart backend

### Error: "Authentication token verification failed"

**Possible causes:**
1. Firebase project ID mismatch (frontend using different project)
2. Service account key is invalid or expired
3. Token verification timeout

**Fix:**
- Verify frontend and backend use same Firebase project
- Download fresh service account key
- Increase token TTL

---

## WHAT CHANGED IN FLOW

**Before (Broken):**
```
Frontend: Send Firebase token
    ↓
Backend: Try to verify as custom JWT
    ↓
❌ Fails with 401 "token missing"
```

**After (Fixed):**
```
Frontend: Send Firebase token
    ↓
Backend: Verify with Firebase Admin SDK
    ↓
Backend: Extract UID and email
    ↓
✅ Create room successfully
```

---

## SECURITY NOTES

1. **Never commit service account key** - Add to `.gitignore`:
   ```
   auraguard-ai-firebase-adminsdk.json
   ```

2. **Never log actual tokens** - Code has safe logging with `[AUTH]` prefix

3. **Firebase UID is the identity** - Not email, not custom user ID

4. **Each request gets fresh token** - No token caching issues

---

## NEXT STEPS

1. ✅ Install firebase-admin
2. ✅ Get service account key from Firebase Console
3. ✅ Update .env with credentials
4. ✅ Restart backend
5. ✅ Test Create Room
6. ✅ Test Join Room
7. ✅ Test two-user meeting

---

## FILES TO COMMIT

```
Modified:
- src/modules/rooms/room.routes.js
- src/modules/rooms/room.controller.js
- src/config/env.js
- src/server.js
- package.json
- .env
- .env.example
- src/config/apiClient.js (frontend)

Created:
- src/config/firebase-admin.js
- src/middlewares/firebase-auth.middleware.js

DO NOT COMMIT:
- auraguard-ai-firebase-adminsdk.json (add to .gitignore)
```

---

## ROOT CAUSE SUMMARY

| Issue | Why It Happened | How Fixed |
|-------|-----------------|-----------|
| 401 Unauthorized | Custom JWT middleware couldn't verify Firebase tokens | Created Firebase middleware using Admin SDK |
| "token missing" error | Middleware was looking for payload.sub (custom JWT field) | Firebase middleware extracts UID from verifyIdToken() |
| MongoDB lookup failed | Tried to find user by Firebase token in User collection | No MongoDB lookup needed for Firebase users |
| Token verification failed | Using wrong verification method (custom JWT vs Firebase) | Using admin.auth().verifyIdToken() |

---

**System is now ready for authentication flow testing.** 🎯
