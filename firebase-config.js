// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDjdLScIQQhp8ZNKNNo7He7rLvpPDGbOTg",
    authDomain: "invisalign-forms.firebaseapp.com",
    projectId: "invisalign-forms",
    storageBucket: "invisalign-forms.firebasestorage.app",
    messagingSenderId: "506139347430",
    appId: "1:506139347430:web:7d93996623e6fccc29ee27",
    measurementId: "G-X6C918GZR3"
};

// Firebase'i başlat
let db = null;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('Firebase başarıyla başlatıldı');
} catch (error) {
    console.error('Firebase başlatma hatası:', error);
}
