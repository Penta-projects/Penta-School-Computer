const admin = require("firebase-admin");

// Replace "serviceAccountKey.json" with the correct path if it's located in a different directory
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://school-computer-system-default-rtdb.firebaseio.com"
});
