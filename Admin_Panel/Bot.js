require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { initializeApp } = require('firebase-admin');
const admin = require('firebase-admin');
const axios = require('axios');

console.log('Bot is up and running');

// Initialize Firebase
const serviceAccount = require('./serviceAccountKey.json');  // Adjust the path as needed
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://school-computer-system-default-rtdb.firebaseio.com'
});
const database = admin.database();

// Initialize Telegram Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Admin validation (replace with actual validation)
const adminUsernames = ["amana_jamal", "netflixinbirr", "TomasMekonenn09101495AA"]; // Admin usernames

// Helper function to fetch and display data from Firebase
async function fetchLabData() {
  try {
    const ref = database.ref('/'); // Replace '/' with your actual path
    const snapshot = await ref.once('value');
    const labsData = snapshot.val();

    if (labsData) {
      let totalComputers = 0;
      let computersNeedingUpdates = 0;
      let totalPerformance = 0;
      let labDataList = [];

      Object.keys(labsData).forEach(labKey => {
        const lab = labsData[labKey];
        if (lab.warranty) {
          totalComputers++;

          if (lab.warranty.processor === 'Old Processor') {
            computersNeedingUpdates++;
          }

          if (lab.performance) {
            const performanceValue = parseFloat(lab.performance) || 0;
            totalPerformance += performanceValue;
          }

          labDataList.push({
            model: lab.model,
            processor: lab.processor,
            ram: lab.ram,
            storage: lab.storage,
            graphicsCard: lab.graphicsCard,
            accessories: lab.accessories || 'None',
            warranty: lab.warranty,
            performance: lab.performance,
            Performancedesc: lab.Performancedesc,
            inventoryDate: lab.inventoryDate,
            installedSoftware: lab.installedSoftware
          });
        }
      });

      return {
        totalComputers,
        computersNeedingUpdates,
        avgPerformance: totalPerformance / totalComputers,
        labDataList
      };
    } else {
      return { message: 'No data available.' };
    }
  } catch (error) {
    console.error('Error fetching data: ', error);
    return { message: 'Error fetching data from Firebase.' };
  }
}


// Command to start the bot
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
  
    // Create inline keyboard with two buttons: "Search" and "View Lab List"
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Search Labs', callback_data: 'search' }],
          [{ text: 'View Lab List', callback_data: 'list' }]
        ]
      }
    };
  
    // Send message with inline keyboard
    bot.sendMessage(chatId, "Welcome! Please choose an option:", keyboard);
});

// Handle button presses
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const action = query.data;
  const username = query.from.username; // Get the username of the person who clicked the button

  if (action === 'search') {
    bot.sendMessage(chatId, "Please type the search term (e.g., /pc 1, /pc 2, etc.)");
  } else if (action === 'list') {
    // Check if the user is an admin by checking the username in the adminUsernames array
    if (adminUsernames.includes(username)) {
      const data = await fetchLabData();
      if (data.message) {
        bot.sendMessage(chatId, data.message);
      } else {
        bot.sendMessage(chatId, `*Total Computers:* ${data.totalComputers}\n` +
                                 `*Computers Needing Updates:* ${data.computersNeedingUpdates}\n` +
                                 `*Average Performance:* ${(data.avgPerformance).toFixed(2)}%`, { parse_mode: 'Markdown' });

        // Optionally, send detailed lab data including installed software
        data.labDataList.forEach(labData => {
          bot.sendMessage(chatId, `
            *${labData.warranty}*
            *Inventory Date:* ${labData.inventoryDate} 
            *Model:* ${labData.model}
            *Processor:* ${labData.processor}
            *RAM:* ${labData.ram}
            *Storage:* ${labData.storage}
            *Graphics Card:* ${labData.graphicsCard}
            *Accessories:* ${labData.accessories}
            *Performance:* ${labData.performance}
            *Performance Description:* ${labData.Performancedesc}
            *Warranty:* ${labData.warranty}
            *Installed Software:*\n ${labData.installedSoftware} 
          `, { parse_mode: 'Markdown' });
        });
      }
    } else {
      // If the username doesn't match, notify the user that they are not authorized
      bot.sendMessage(chatId, "You are not an admin. You do not have access to this data.");
    }
  }

  // Acknowledge the callback query to remove the loading indicator
  bot.answerCallbackQuery(query.id);
});


// Command to search for lab data
bot.onText(/\/pc (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const searchTerm = match[1].toLowerCase();
  const username = msg.from.username;

  if (adminUsernames.includes(username)) {
    const data = await fetchLabData();
    if (data.message) {
      bot.sendMessage(chatId, data.message);
    } else {
      const filteredLabs = data.labDataList.filter(lab => 
      lab.warranty.toLowerCase().includes(searchTerm)|| 
      (lab.accessories && lab.accessories.toLowerCase().includes(searchTerm))|| 
      (lab.Processor && lab.Processor.toLowerCase().includes(searchTerm)) // Check for lost accessories
      );

      if (filteredLabs.length === 0) {
        bot.sendMessage(chatId, "No matching results found.");
      } else {
        filteredLabs.forEach(labData => {
          bot.sendMessage(chatId, `
             *${labData.warranty}*
            *Model*: ${labData.model}
            *Processor*: ${labData.processor}
            *RAM*: ${labData.ram}
            *Storage*: ${labData.storage}
            *Graphics Card*: ${labData.graphicsCard}
            *Accessories*: ${labData.accessories}
            *Performance*: ${labData.performance}
            *Performance Description*: ${labData.Performancedesc}
          `, { parse_mode: 'Markdown' });
        });
      }
    }
  } else {
    bot.sendMessage(chatId, "You are not an admin.");
  }
});
