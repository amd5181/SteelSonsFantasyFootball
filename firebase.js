// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyJ4crvTcbE2uHAfZHiTICcGP74kKFWvE",
  authDomain: "steelsonsfantasyfootball.firebaseapp.com",
  projectId: "steelsonsfantasyfootball",
  storageBucket: "steelsonsfantasyfootball.appspot.com",
  messagingSenderId: "693967635959",
  appId: "1:693967635959:web:1433bf20c411bbf5cb5af2",
  measurementId: "G-HB0N5WMBFM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
