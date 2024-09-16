const net = require('net'); // Add this import

const serverUrl = '213.171.203.19';
const port = 8000;
const socket = new net.Socket(); // Initialize TCP socket
let isConnected = false;
const eventCodePrefix = ''; // All messages start with 'L'
let currentLocation = { latitude: 0, longitude: 0 }; // Initialize current location

// Connect to the TCP server
function connect() {
    console.log('Connecting to server');
    console.log('Server URL:', serverUrl);
    console.log('Port:', port);
    
    socket.on('data', (data) => {
        console.log('Received:', data.toString());
    });

    socket.on('close', () => {
        isConnected = false;
        console.log('Disconnected from server');
    });
1
    socket.on('error', (error) => {
        console.error('Socket Error:', error.message);
        isConnected = false;
    });

    socket.setTimeout(60000, () => {
        if (!isConnected) {
            console.log('Connection timed out');
            socket.destroy();
        }
    });

    socket.connect(port, serverUrl, () => {
        isConnected = true;
        console.log('Connected to server');
    });

}

// Send a formatted message to the server
function sendMessage(eventCode, phoneNumber, latitude = 0, longitude = 0, altitude = 0, speed = 0, accuracy = 0, bearing = 0, timestamp, preAlarmEnd = '', suffix = '') {
  //if (!isConnected) {
   // console.error('Cannot send message: Not connected');
   // return;
  //}

  // Create the formatted message string
  const message = formatMessage(eventCode, phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, timestamp, preAlarmEnd, suffix);
  socket.write(message + '\x04'); // Append EOT character
  console.log('Sent:', message);
}

// Format the message based on the fields
function formatMessage(eventCode, phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, timestamp, preAlarmEnd, suffix) {
  const fields = [
    `${eventCodePrefix}${eventCode}`, // Event Code prefixed with 'L'
    phoneNumber || '+447710777938', // Phone number of the device
    latitude.toFixed(6), // Latitude in decimal degrees
    longitude.toFixed(6), // Longitude in decimal degrees
    altitude.toFixed(2), // Altitude in meters
    speed.toFixed(2), // Speed in m/s
    accuracy.toFixed(0), // Accuracy in meters
    bearing.toFixed(0), // Bearing in degrees
    timestamp || '', // Timestamp formatted as yyyyMMddHHmmss
    preAlarmEnd || '', // Optional PreAlarmEnd time
    suffix || '' // Status information (e.g., battery status)
  ];
  // Join fields with pipe delimiter
  return fields.join('|');
}

// Utility to get the current timestamp in the required format
function getCurrentTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:T]/g, '').split('.')[0];
}

// Helper Functions for Event Codes
function sendLocatorAppExit(phoneNumber) {
  sendMessage('LAF', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
}

function sendLocatorAppStart(phoneNumber) {
  sendMessage('LAS', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
}

function sendLocatorShiftReporting(phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing) {
  sendMessage('LCI', phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, getCurrentTimestamp(), '', 'CP');
}

function sendLocatorLowPower(phoneNumber) {
  sendMessage('LCP', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
}

function sendLocatorSmsRequestReply(phoneNumber, latitude, longitude) {
  sendMessage('LDI', phoneNumber, latitude, longitude, 0, 0, 0, 0, getCurrentTimestamp());
}

function sendLocatorManDownPreAlarmExpired(phoneNumber) {
  sendMessage('LMD', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
}

function sendLocatorManDownCancel(phoneNumber) {
  sendMessage('LMDC', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
}

function sendLocatorPowerOk(phoneNumber) {
  sendMessage('LNP', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
}


function sendLocatorPreAlarmExtended(phoneNumber) {
  sendMessage('LSE', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
}


function sendLocatorShiftBegin(phoneNumber) {
    sendMessage('LSB', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
  }

  
function sendLocatorShiftFinished(phoneNumber) {
  sendMessage('LSF', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
}

function sendLocatorSingleReport(phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing) {
  sendMessage('LTI', phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, getCurrentTimestamp());
}

function sendLocatorPreAlarm(phoneNumber, preAlarmText = '') {
  sendMessage('LTP', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp(), '', preAlarmText);
}

function sendLocatorPreAlarmCancel(phoneNumber) {
  sendMessage('LTPC', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
}

function sendLocatorAlarmSOS(phoneNumber, latitude, longitude) {
  sendMessage('LTS', phoneNumber, latitude, longitude, 0, 0, 0, 0, getCurrentTimestamp());
}

function sendLocatorAlarmCancel(phoneNumber, latitude, longitude) {
  sendMessage('LTSC', phoneNumber, latitude, longitude, 0, 0, 0, 0, getCurrentTimestamp(), '', 'NP');
}

function sendLocatorDuressAlert(phoneNumber, latitude, longitude) {
  sendMessage('LUD', phoneNumber, latitude, longitude, 0, 0, 0, 0, getCurrentTimestamp());
}

// Disconnect the TCP connection
function disconnect() {
  if (socket) {
    socket.end();
  }
}

// Export the functions
module.exports = {
  connect,
  sendLocatorAppExit,
  sendLocatorAppStart,
  sendLocatorShiftReporting,
  sendLocatorLowPower,
  sendLocatorSmsRequestReply,
  sendLocatorManDownPreAlarmExpired,
  sendLocatorManDownCancel,
  sendLocatorPowerOk,
  sendLocatorShiftBegin,
  sendLocatorPreAlarmExtended,
  sendLocatorShiftFinished,
  sendLocatorSingleReport,
  sendLocatorPreAlarm,
  sendLocatorPreAlarmCancel,
  sendLocatorAlarmSOS,
  sendLocatorAlarmCancel,
  sendLocatorDuressAlert,
  disconnect,
  setCurrentLocation
};


connect()
setTimeout(() => {
    testAllSendCommands('+447710777938')


}, 3000)
function setCurrentLocation(latitude, longitude) {
  currentLocation = { latitude, longitude };
}

setCurrentLocation(51.5074, -0.1278)

function testAllSendCommands(phoneNumber) {
    
    setTimeout(() => sendLocatorShiftBegin(phoneNumber, 51.5074, -0.1278), 12000);    
    setTimeout(() => sendLocatorShiftReporting(phoneNumber, 51.5074, -0.1278, 10, 5, 1, 90), 0);
    setTimeout(() => sendLocatorShiftFinished(phoneNumber), 1000);
    
    setTimeout(() => sendLocatorPowerOk(phoneNumber), 2000);
    setTimeout(() => sendLocatorLowPower(phoneNumber), 3000);
  
    setTimeout(() => sendLocatorAppStart(phoneNumber), 4000);
    setTimeout(() => sendLocatorAppExit(phoneNumber), 5000);
    
//    setTimeout(() => sendLocatorSmsRequestReply(phoneNumber, 51.5074, -0.1278), 6000);
  
    setTimeout(() => sendLocatorPreAlarm(phoneNumber, 'PreAlarmText'), 7000);
    setTimeout(() => sendLocatorPreAlarmCancel(phoneNumber), 8000);
    setTimeout(() => sendLocatorPreAlarmExtended(phoneNumber), 9000);

    setTimeout(() => sendLocatorManDownPreAlarmExpired(phoneNumber), 10000);
    setTimeout(() => sendLocatorManDownCancel(phoneNumber), 11000);
  
    
    setTimeout(() => sendLocatorSingleReport(phoneNumber, 51.5074, -0.1278, 10, 5, 1, 90), 13000);
    setTimeout(() => sendLocatorDuressAlert(phoneNumber, 51.5074, -0.1278), 14000);
    setTimeout(() => sendLocatorAlarmSOS(phoneNumber, 51.5074, -0.1278), 15000);
    setTimeout(() => sendLocatorAlarmCancel(phoneNumber, 51.5074, -0.1278), 16000);
  }