importScripts('https://www.gstatic.com/firebasejs/8.0.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.0.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAm_zoqGlX07ABxPAL0hHFf7YTvYm1Ou1U',
  authDomain: 'fire-demo-a766b.firebaseapp.com',
  projectId: 'fire-demo-a766b',
  storageBucket: 'fire-demo-a766b.appspot.com',
  messagingSenderId: '205007761014',
  appId: '1:205007761014:web:5deca532d48f2ac78d3957',
});

const messaging = firebase.messaging();
