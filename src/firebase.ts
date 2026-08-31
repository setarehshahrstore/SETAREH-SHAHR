import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKO9ntx4T8QjjeM0snNt95tG6HUqhcii8",
  authDomain: "setareh-shahr.firebaseapp.com",
  projectId: "setareh-shahr",
  storageBucket: "setareh-shahr.firebasestorage.app",
  messagingSenderId: "917912423484",
  appId: "1:917912423484:web:f95762bb0f2a515577c739",
  measurementId: "G-DXP3DVYPEH"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with auto-detect long polling and resilient cache settings
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

