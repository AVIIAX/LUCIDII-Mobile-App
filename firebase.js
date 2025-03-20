

// firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAl7px8bchWy4UkRglseH9yb252YPI1WkY",
  authDomain: "soundwave-182cf.firebaseapp.com",
  projectId: "soundwave-182cf",
  storageBucket: "soundwave-182cf.firebasestorage.app",
  messagingSenderId: "956308046544",
  appId: "1:956308046544:web:545babcc35bd01ac4f94d5"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

