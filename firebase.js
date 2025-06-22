// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCyJ4crvTcbE2uHAfZHiTICcGP74kKFWvE",
  authDomain: "steelsonsfantasyfootball.firebaseapp.com",
  projectId: "steelsonsfantasyfootball",
  storageBucket: "steelsonsfantasyfootball.firebasestorage.app",
  messagingSenderId: "693967635959",
  appId: "1:693967635959:web:1433bf20c411bbf5cb5af2",
  measurementId: "G-HB0N5WMBFM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); // <-- this line was missing
