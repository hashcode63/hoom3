import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBS5lHg5sPVaJSUpiSnoUl68uLgRmb0LxY",
  authDomain: "hoom-cef22.firebaseapp.com",
  projectId: "hoom-cef22",
  storageBucket: "hoom-cef22.firebasestorage.app",
  messagingSenderId: "455036920431",
  appId: "1:455036920431:web:1b8e7e2025f5597b38239a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };