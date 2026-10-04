import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtD3FLtVKPBg9JtJTEBEVpcLTxbthpGyk",
  authDomain: "needmap-hackathon.firebaseapp.com",
  projectId: "needmap-hackathon",
  storageBucket: "needmap-hackathon.firebasestorage.app",
  messagingSenderId: "385002157682",
  appId: "1:385002157682:web:3296ba12f9bd711ae0f4eb",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);