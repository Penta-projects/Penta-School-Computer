// Import Firebase SDK functions for Realtime Database
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, push, set, get } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js"; // Import ref, push, set

const firebaseConfig = {
  apiKey: "AIzaSyA6w4ppnYX9jB6ngQ_Ow33IFIUYmsiwOr0",
  authDomain: "school-computer-system.firebaseapp.com",
  databaseURL: "https://school-computer-system-default-rtdb.firebaseio.com", // Realtime Database URL
  projectId: "school-computer-system",
  storageBucket: "school-computer-system.firebasestorage.app",
  messagingSenderId: "794625580029",
  appId: "1:794625580029:web:53091bdbcb163313f45794",
  measurementId: "G-VK50LNKMY4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);


// Form submission handler
document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();  // Prevent page reload
  
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
  
    // Get a reference to the specific user's credentials
    const userRef = ref(database, 'Admin/' + username);
  
    // Fetch data from Firebase Realtime Database
    get(userRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
  
          // Check if the password matches the stored one
          if (userData.password === password) {
            localStorage.setItem('adminUsername', username); // Assuming 'username' is the variable containing the admin username
            window.location.href = 'fis.scs.ct.ws';
        } else {
            const passError = document.querySelector('.pass-error');
            passError.style.display = 'block';
          }
        } else {
          const usernameError = document.querySelector('.username-error');
          usernameError.style.display = 'block';
        }
      })
      .catch((error) => {
        console.error("Error reading data from Firebase:", error);
        alert("Failed to authenticate. Please try again.");
      });
  });
