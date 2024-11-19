import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6w4ppnYX9jB6ngQ_Ow33IFIUYmsiwOr0",
    authDomain: "school-computer-system.firebaseapp.com",
    databaseURL: "https://school-computer-system-default-rtdb.firebaseio.com",
    projectId: "school-computer-system",
    storageBucket: "school-computer-system.appspot.com",
    messagingSenderId: "794625580029",
    appId: "1:794625580029:web:53091bdbcb163313f45794",
    measurementId: "G-VK50LNKMY4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const adminusername = localStorage.getItem('adminUsername'); // Retrieve stored admin username
console.log(adminusername); // Log admin username for debugging

const activityDataContainer = document.getElementById('activityData');
const searchInput = document.querySelector('.search-box input');
const spinner = document.getElementById('spinner'); // Spinner element
let labDataList = [];


async function updateDashboard() {
    const preloader = document.getElementById('preloader'); // Get the preloader element
    const labsRef = ref(database);

    // Show spinner before data fetching
    if (preloader) preloader.style.display = 'flex';

    try {
        const snapshot = await get(labsRef);
        if (snapshot.exists()) {
            const labsData = snapshot.val();
            labDataList = []; // Clear the labDataList

            let totalComputers = 0;
            let computersNeedingUpdates = 0;
            let totalPerformance = 0;

            // Process and populate labDataList
            Object.keys(labsData).forEach((labKey, index) => {
                const labData = labsData[labKey];
                if (labData.warranty) {
                    totalComputers++;

                    if (labData.performance == 0) {
                        computersNeedingUpdates++;
                    }
                    if (labData.performance) {
                        totalPerformance += parseFloat(labData.performance) || 0;
                    }

                    // Add lab data to labDataList for search functionality
                    labDataList.push({
                        model: labData.model,
                        processor: labData.processor,
                        ram: labData.ram,
                        storage: labData.storage,
                        graphicsCard: labData.graphicsCard,
                        accessories: labData.accessories || "None",
                        warranty: labData.warranty, // Already formatted
                        performance: labData.performance,
                        Performancedesc: labData.Performancedesc,
                        installedSoftware: labData.installedSoftware,
                        inventoryDate: labData.inventoryDate
                    });
                }
            });

        // Sort labDataList by the numerical order in the warranty field
        labDataList.sort((a, b) => {
            const getNumber = (warranty) => {
                // Ensure warranty is a valid string before trying to match a number
                if (warranty && typeof warranty === 'string') {
                    const match = warranty.match(/\d+$/);
                    return match ? parseInt(match[0], 10) : 0; // Return 0 if no number is found
                }
                return 0; // Return 0 if warranty is null or undefined
            };
            return getNumber(a.warranty) - getNumber(b.warranty);
        });


            // Update dashboard elements
            document.getElementById('totalComputers').innerText = totalComputers;
            document.getElementById('needUpdates').innerText = computersNeedingUpdates;
            document.getElementById('avgPerformance').innerText = totalComputers
                ? `${(totalPerformance / totalComputers).toFixed(2)}%`
                : "N/A";

            // Display all activities
            displayActivities(labDataList);
        } else {
            console.log('No data available.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        if (preloader) preloader.style.display = 'none';
    }
}


// Function to display activities in the dashboard
function displayActivities(activities) {
    activityDataContainer.innerHTML = ''; // Clear previous activity data

    activities.forEach((labData) => {
        const activityElement = document.createElement('div');
        activityElement.classList.add('data');

        // Apply a red border if performance is 0
        const borderStyle = labData.performance == 0 ? 'border: 2px solid red; box-shadow: 3px 3px 0.5px red;' : '';

        // Convert installed software into HTML list
        const installedSoftwareHTML = labData.installedSoftware?.length
            ? `<ul>${labData.installedSoftware.map(software => `<li>${software}</li>`).join('')}</ul>`
            : "None";

        activityElement.innerHTML = `
            <div class="activity-card" style="${borderStyle}">
                <h3 class="activity-title">${labData.warranty}</h3>
                <h3 class="activity-date">${labData.inventoryDate}</h3>
                <div class="activity-details">
                    <div class="activity-item">
                        <span class="activity-label">Model:</span>
                        <span class="activity-value">${labData.model}</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-label">Processor:</span>
                        <span class="activity-value">${labData.processor}</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-label">RAM:</span>
                        <span class="activity-value">${labData.ram}</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-label">Storage:</span>
                        <span class="activity-value">${labData.storage}</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-label">Graphics Card:</span>
                        <span class="activity-value">${labData.graphicsCard}</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-label">Lost Accessories:</span>
                        <span class="activity-value">${labData.accessories}</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-label">Performance:</span>
                        <span class="activity-value">${labData.performance}</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-label">Performance Description:</span>
                        <span class="activity-value">${labData.Performancedesc}</span>
                    </div>
                    <div class="activity-item">
                        <span class="activity-label">Installed Software:</span>
                        <span class="activity-value">${installedSoftwareHTML}</span>
                    </div>
                </div>
            </div>
        `;

        activityDataContainer.appendChild(activityElement);
    });
}


// Function to filter activities based on search input
function filterActivities() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredActivities = labDataList.filter(lab => {
        return (
            lab.warranty.toLowerCase().includes(searchTerm) ||
            lab.processor.toLowerCase().includes(searchTerm) ||
            lab.ram.toLowerCase().includes(searchTerm) ||
            lab.storage.toLowerCase().includes(searchTerm) ||
            lab.graphicsCard.toLowerCase().includes(searchTerm)
        );
    });
    displayActivities(filteredActivities);
}

// Event listener for search functionality
searchInput.addEventListener('input', filterActivities);

// Initialize dashboard on page load
updateDashboard();
