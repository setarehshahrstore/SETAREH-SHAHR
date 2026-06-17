import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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
export const db = getFirestore(app);
