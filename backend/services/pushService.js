const admin = require('firebase-admin');
const User = require('../models/User');
const serviceAccount = require('../firebase-service-account.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const sendPushToUser = async (userId, title, body) => {
  try {
    const user = await User.findById(userId);
    if (!user?.fcmToken) {
      console.log(`⚠️ No FCM token for user ${userId}`);
      return;
    }

    await admin.messaging().send({
      token: user.fcmToken,
      notification: { title, body }
    });

    console.log(`📲 Push sent to ${userId}: ${body}`);
  } catch (error) {
    console.error(`❌ Failed to send push:`, error);
  }
};

module.exports = { sendPushToUser };
