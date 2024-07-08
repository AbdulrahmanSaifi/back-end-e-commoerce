var admin = require("firebase-admin");
var serviceAccount = require("../config/serviceAccountKey.json");
const { initializeApp } = require("firebase/app");
const { getStorage, ref, deleteObject, getMetadata } = require("firebase/storage");

// تهيئة Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://project-e-commoerce.appspot.com"
});

const bucket = admin.storage().bucket();

// إعداد firebaseConfig
const firebaseConfig = {
    apiKey: "AIzaSyB5sQh7haB2fF9rfu0gQ3eaz5UroHjb0pA",
    authDomain: "project-e-commoerce.firebaseapp.com",
    projectId: "project-e-commoerce",
    storageBucket: "project-e-commoerce.appspot.com",
    messagingSenderId: "579422576655",
    appId: "1:579422576655:web:766fc88870ea3c44aac37a",
    measurementId: "G-NVH61Q9JVW"
};

// تهيئة Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

// الدالة لحذف الصورة
const deleteImage = async (fileName) => {
    const desertRef = ref(storage, `${fileName}`);
    try {
        // التحقق من وجود الملف
        const metadata = await getMetadata(desertRef);
        console.log(`File ${fileName} exists. Proceeding to delete.`);
        // حذف الملف
        await deleteObject(desertRef);
        console.log(`The photo ${fileName} has been deleted successfully`);
    } catch (error) {
        if (error.code === 'storage/object-not-found') {
            console.error(`File ${fileName} does not exist.`);
        } else {
            console.error(`Error deleting file ${fileName}:`, error);
        }
    }
};

module.exports = { bucket, storage, ref, deleteObject, deleteImage };
