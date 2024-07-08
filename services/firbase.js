var admin = require("firebase-admin");
var serviceAccount = require("../config/serviceAccountKey.json");
const googleStorage = require('@google-cloud/storage')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://project-e-commoerce.appspot.com"
});

const bucket = admin.storage().bucket()

module.exports = { bucket }

