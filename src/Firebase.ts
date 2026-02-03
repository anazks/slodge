// firebase.js    ← better name, no default export needed
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyADfELnI94tZr1YXE3Qab9ZuQNQ374fDtA",
  authDomain: "landslide-c833e.firebaseapp.com",
  databaseURL: "https://solariot-c3f71-default-rtdb.firebaseio.com/",   // ← note: this URL looks wrong – see below
  projectId: "landslide-c833e",
  storageBucket: "landslide-c833e.appspot.com",                         // corrected
  messagingSenderId: "381810903243",
  appId: "1:381810903243:web:402f46b4752ad2d7d0b34e",
  measurementId: "G-J8FDMH8JKS"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);