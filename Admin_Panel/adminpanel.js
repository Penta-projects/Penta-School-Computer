import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6w4ppnYX9jB6ngQ_Ow33IFIUYmsiwOr0",
    authDomain: "school-computer-system.firebaseapp.com",
    databaseURL: "https://school-computer-system-default-rtdb.firebaseio.com",
    projectId: "school-computer-system",
    storageBucket: "school-computer-system.firebasestorage.app",
    messagingSenderId: "794625580029",
    appId: "1:794625580029:web:53091bdbcb163313f45794",
    measurementId: "G-VK50LNKMY4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const adminusername = localStorage.getItem('adminUsername'); // Get the value stored under the key 'adminUsername'

console.log(adminusername); // Will log the value (the stored admin username)


const activityDataContainer = document.getElementById('activityData');
const searchInput = document.querySelector('.search-box input');
let labDataList = [];

// Function to fetch and display data from Firebase
async function updateDashboard() {
    const labsRef = ref(database);

    try {
        const snapshot = await get(labsRef);
        if (snapshot.exists()) {
            const labsData = snapshot.val();
            labDataList = []; // Clear the labDataList

            let totalComputers = 0;
            let computersNeedingUpdates = 0;
            let totalPerformance = 0;
            let performanceCount = 0;

            // Populate labDataList and build dashboard data
            Object.keys(labsData).forEach(labKey => {
                const labData = labsData[labKey];
                if (labData.warranty) {
                    totalComputers++;

                    if (labData.warranty.processor === 'Old Processor') {
                        computersNeedingUpdates++;
                    }

                    if (labData.performance) {
                        const performanceValue = parseFloat(labData.performance) || 0; // Fallback to 0 if parsing fails
                        totalPerformance += performanceValue;
                        
                    }

                    // Add lab data to labDataList for search functionality
                    labDataList.push({
                        model: labData.model,
                        processor: labData.processor,
                        ram: labData.ram,
                        storage: labData.storage,
                        graphicsCard: labData.graphicsCard,
                        accessories: labData.accessories || "None",
                        warranty: labData.warranty,
                        performance: labData.performance,
                        Performancedesc: labData.Performancedesc,
                        installedSoftware: labData.installedSoftware,
                        inventoryDate: labData.inventoryDate
                    });
                }
            });

            // Display total counts and performance
            document.getElementById('totalComputers').innerText = totalComputers;
            document.getElementById('needUpdates').innerText = computersNeedingUpdates;
            document.getElementById('avgPerformance').innerText = `${(totalPerformance / totalComputers).toFixed(2)}%`

            // Display all activities initially
            displayActivities(labDataList);
        } else {
            console.log('No data available.');
        }
    } catch (error) {
        console.error('Error fetching data: ', error);
    }
}

function displayActivities(activities) {
    activityDataContainer.innerHTML = ''; // Clear previous activity data

    activities.forEach((labData) => {
        const activityElement = document.createElement('div');
        activityElement.classList.add('data');

        // Display installed software as a list
        const installedSoftwareHTML = labData.installedSoftware && labData.installedSoftware.length
            ? `<ul>${labData.installedSoftware.map(software => `<li>${software}</li>`).join('')}</ul>`
            : "None";

        activityElement.innerHTML = `
            <div class="activity-card">
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


// Filter activities based on search term
function filterActivities() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredActivities = labDataList.filter(lab => {
        return (
            lab.warranty.toLowerCase().includes(searchTerm) ||
            lab.accessories.toLowerCase().includes(searchTerm) ||
            lab.ram.toLowerCase().includes(searchTerm) ||
            lab.storage.toLowerCase().includes(searchTerm) ||
            lab.graphicsCard.toLowerCase().includes(searchTerm)
        );
    });
    displayActivities(filteredActivities);
}

// Event listener for search
searchInput.addEventListener('input', filterActivities);

// Call to update dashboard and display data on page load
updateDashboard();
