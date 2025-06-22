import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCyJ4crvTcbE2uHAfZHiTICcGP74kKFWvE",
  authDomain: "steelsonsfantasyfootball.firebaseapp.com",
  projectId: "steelsonsfantasyfootball"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app, "gs://steelsonsfantasyfootball.firebasestorage.app");
