// Import Firebase SDK functions for Realtime Database
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, set, get, remove } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js"; // Added get and remove

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

const os = navigator;
console.log(os); // "Win32", "MacIntel", "Linux x86_64", "iPhone", etc.
console.log(window);

// Example of submitting data to Realtime Database
const form = document.querySelector('.form');

  document.querySelector('input[name="processor"]').value = "Intel(R) Core(TM) i5-4430 CPU @ 3.00GHz 3.00 GHz";

function getFormattedDate() {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false // To use a 24-hour format, set it to false
  };
  const currentDate = new Date();
  return currentDate.toLocaleString('en-US', options); // Formats to 'Monday, Nov 11, 2024 18:35'
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
    // Ask for the username and password
  const username = prompt("Enter your username:");
  const password = prompt("Enter your password:");

  // Get data from the form
  const model = form.querySelector('input[name="model"]').value;
  const processor = form.querySelector('input[name="processor"]').value;
  const ram = form.querySelector('input[name="ram"]').value;
  const storage = form.querySelector('input[name="storage"]').value;
  const graphicsCard = form.querySelector('input[name="graphics-card"]').value;
  const operatingSystem = form.querySelector('input[name="operating-system"]').value;
  const warranty = form.querySelector('input[name="warranty"]').value;
  const accessories = form.querySelector('input[name="accessories"]').value;
  const performance = form.querySelector('input[name="Performance"]').value;
  const Performancedesc = form.querySelector('input[name="Performancedesc"]').value;
  const CurrentSoftwareversion = form.querySelector('input[name="Current-Software-version/Updates"]').value;

  // Get selected checkboxes for installed software
  const checkboxes = form.querySelectorAll('.input-box-key-checkbox input[type="checkbox"]');
  let installedSoftware = [];

  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      installedSoftware.push(checkbox.value); // Add checked software to the array
    }
  });

  // Get the current date in the desired format
  const inventoryDate = getFormattedDate();

  try {
    // Create a reference to the "computerDetails" node in the Realtime Database
    const dbRef = ref(database, warranty); // Using warranty as the unique identifier

    // Fetch existing data with the same warranty
    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
      // If data already exists for this warranty, compare and keep the latest one
      const existingData = snapshot.val();
      const existingDate = existingData.inventoryDate;
      const currentDate = inventoryDate;

      // Compare dates (latest one should be kept)
      if (new Date(currentDate) > new Date(existingDate)) {
        // If the current date is later, delete the old entry and add the new one
        await remove(dbRef);
        console.log("Old entry removed!");

        // Set the new data in the Realtime Database
        await set(dbRef, {
          model,
          processor,
          ram,
          storage,
          graphicsCard,
          operatingSystem,
          warranty,
          accessories,
          performance,
          Performancedesc,
          installedSoftware, // Added checked software data
          height: window.innerHeight,
          width: window.innerWidth,
          CurrentSoftwareversion,
          inventoryDate, // Add the formatted date to the database
          username
        });
        console.log("New data successfully written to Realtime Database!");
        alert("New data successfully written to Realtime Database!");
      } else {
        console.log("No need to update. Existing entry is newer.");
      }
    } else {
      // If no existing data, just add the new data
      await set(dbRef, {
        model,
        processor,
        ram,
        storage,
        graphicsCard,
        operatingSystem,
        warranty,
        accessories,
        performance,
        Performancedesc,
        installedSoftware, // Added checked software data
        height: window.innerHeight,
        width: window.innerWidth,
        CurrentSoftwareversion,
        inventoryDate, // Add the formatted date to the database
        username
      });
      console.log("Data successfully written to Realtime Database!");
      alert("Data successfully written to Realtime Database!");
    }
  } catch (e) {
    console.error("Error writing data to Realtime Database: ", e);
  }
});

// Example function to get device information
function getDeviceInfo() {
  const os = navigator.userAgentData.platform; // Detect the operating system
  const userAgent = navigator.userAgent; // Get the user-agent string for more details
  const language = navigator.language; // Get the browser's language
  const memory = navigator.deviceMemory || 'Unknown'; // Get device memory (in GB)
  const cores = navigator.hardwareConcurrency || 'Unknown'; // Number of CPU cores

  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  return {
    ram: `${memory} GB`,      // Fill with device memory (in GB) or default value
    operatingSystem: os,     // Fill with the detected operating system
    language: language,      // Browser language
    userAgent: userAgent,    // Full user-agent string
    screenResolution: `${screenWidth}x${screenHeight}`, // Screen resolution
    viewportResolution: `${viewportWidth}x${viewportHeight}`, // Viewport size
    cores: `${cores} Cores`, // Number of CPU cores
  };
}

// Select the "Share" button
const shareButton = document.querySelector('.share-btn');

// Add event listener to the Share button
shareButton.addEventListener('click', () => {
  // Get the device info dynamically
  const deviceInfo = getDeviceInfo();
  
  // Automatically fill the inputs with device information
  document.querySelector('input[name="ram"]').value = deviceInfo.ram;
  document.querySelector('input[name="operating-system"]').value = deviceInfo.operatingSystem;
  document.querySelector('input[name="graphics-card"]').value = "none";
});
