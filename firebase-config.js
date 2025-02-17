// Ensure Firebase SDK is loaded
if (typeof firebase === "undefined") {
    console.error("❌ Firebase SDK not loaded. Check script order in index.html!");
} else {
    console.log("✅ Firebase SDK loaded!");

    // Firebase Configuration
    const firebaseConfig = {
        apiKey: "AIzaSyB5pIFNix1c0AWl134Ixe4CzufOtMSsfGk",
        authDomain: "panangad-vhss-admission.firebaseapp.com",
        projectId: "panangad-vhss-admission",
        storageBucket: "panangad-vhss-admission.appspot.com",
        messagingSenderId: "1049022927752",
        appId: "1:1049022927752:web:32cb80e4b529d69c81a03d"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Firebase services
    window.auth = firebase.auth();  // ✅ Store globally
    window.db = firebase.firestore(); // ✅ Store globally

    console.log("✅ Firebase initialized successfully!");
}
