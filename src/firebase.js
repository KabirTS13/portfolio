import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCPJ8opIFdCa5kMW8mw6FQULq0lrXnuzA0",
  authDomain: "ksportfolio-d0bd8.firebaseapp.com",
  projectId: "ksportfolio-d0bd8",
  storageBucket: "ksportfolio-d0bd8.appspot.com",
  messagingSenderId: "960983253487",
  appId: "1:960983253487:web:41d4afc539ca6200ceb61a"
};

// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp)

export { db, storage };