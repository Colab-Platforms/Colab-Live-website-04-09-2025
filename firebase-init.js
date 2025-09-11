// firebase-init.js

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCzLQSsIRMxJn1aDzyqV2aBog9ALlcSK2w",
  authDomain: "blog-data-228c5.firebaseapp.com",
  projectId: "blog-data-228c5",
  storageBucket: "blog-data-228c5.firebasestorage.app",
  messagingSenderId: "809688826345",
  appId: "1:809688826345:web:8f93deadc603e5e86b8b78",
  measurementId: "G-ZGMTJXVVSF"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
// const storage = firebase.storage(); // Removed as Firebase Storage is not used
