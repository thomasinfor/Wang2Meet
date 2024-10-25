importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBemPvV-6idk0CPddSa1kS0M6jXVtcH380",
  authDomain: "w2m.wang.works",
  projectId: "when2meet-11dfe",
  storageBucket: "when2meet-11dfe.appspot.com",
  messagingSenderId: "344365803313",
  appId: "1:344365803313:web:d7741bb61260898ef37210",
  measurementId: "G-0P4MSW3QPS"
};

const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
