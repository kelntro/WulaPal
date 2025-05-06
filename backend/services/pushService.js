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
      notification: { title, body },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
          tag: `${userId}-${Date.now()}`, // unique tag per user+timestamp
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            contentAvailable: true
          }
        }
      }
    });     

    console.log(`📲 Push sent to ${userId}: ${body}`);
  } catch (error) {
    console.error(`❌ Failed to send push to ${userId}:`, error.message);

    // 🧹 Cleanup invalid token
    if (error.code === 'messaging/registration-token-not-registered') {
      await User.findByIdAndUpdate(userId, { $unset: { fcmToken: "" } });
      console.log(`🧹 Invalid FCM token removed for ${userId}`);
    }
  }
};


module.exports = { sendPushToUser };
