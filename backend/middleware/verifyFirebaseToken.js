const admin = require('firebase-admin');
const mongoose = require('mongoose');
const User = require('../models/User');

let firebaseReady = false;

function initFirebaseAdmin() {
  if (firebaseReady || admin.apps.length) {
    firebaseReady = true;
    return;
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_PRIVATE_KEY || !FIREBASE_CLIENT_EMAIL) {
    throw new Error('Missing Firebase Admin environment variables.');
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
  firebaseReady = true;
}

async function verifyFirebaseToken(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Missing Firebase ID token.' });
    }

    if (process.env.DEV_AUTH_BYPASS === 'true' && token === 'dev-token') {
      req.user = {
        uid: 'demo-user',
        email: 'demo@local.test',
        name: 'Demo User'
      };
      return next();
    }

    initFirebaseAdmin();

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email || '',
      name: decoded.name || decoded.email || ''
    };

    if (mongoose.connection.readyState !== 1) {
      console.warn('User sync skipped: MongoDB is not connected.');
      return next();
    }

    try {
      await User.findOneAndUpdate(
        { uid: req.user.uid },
        { uid: req.user.uid, email: req.user.email, name: req.user.name },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (dbError) {
      console.warn('User sync skipped:', dbError.message);
    }

    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ message: 'Invalid or expired Firebase ID token.' });
  }
}

module.exports = verifyFirebaseToken;
