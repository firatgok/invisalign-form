// Firebase Configuration
// Bu dosyayı Firebase Console'dan aldığınız bilgilerle güncelleyin
// https://console.firebase.google.com/ adresinden proje oluşturup yapılandırma bilgilerinizi buraya ekleyin

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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
