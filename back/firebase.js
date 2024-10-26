const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getMessaging } = require("firebase-admin/messaging");

const firebaseApp = initializeApp({
  credential: cert(require("./firebase-service-account.json"))
});
exports.auth = getAuth(firebaseApp);
exports.messaging = getMessaging(firebaseApp);
