import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, setLogLevel } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyD_zTfT_3SCTCMMtb2yROaKHREPfGdk57g",
  authDomain: "whatsapp-video-site.firebaseapp.com",
  databaseURL: "https://whatsapp-video-site-default-rtdb.firebaseio.com",
  projectId: "whatsapp-video-site",
  storageBucket: "whatsapp-video-site.firebasestorage.app",
  messagingSenderId: "2271699766",
  appId: "1:2271699766:web:8e6cbb131aeb023eab0997",
  measurementId: "G-8D731M93SH"
};

// Silence harmless internal connection warning logs in web containers
setLogLevel('silent');

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore directly with long-polling to prevent initial WebChannel probe failure
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const rtdb = getDatabase(app);
