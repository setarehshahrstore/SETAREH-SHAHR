import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBKQ9mtx4T8QjjeM8snNt95tG6HUqhcii8",
  authDomain: "setareh-shahr.firebaseapp.com",
  projectId: "setareh-shahr",
  storageBucket: "setareh-shahr.firebasestorage.app",
  messagingSenderId: "917912423484",
  appId: "1:917912423484:web:f95762ba0f2a515577c739",
  measurementId: "G-DXP3DVYPEH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);
