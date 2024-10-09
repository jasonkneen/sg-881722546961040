import net from 'net';

let socket = null;
let isConnected = false;
let isConnecting = false;
let currentLocation = { latitude: 0, longitude: 0 };
const eventCodePrefix = '';
const serverUrl = '213.171.203.19';
const port = 8000;
const initialReconnectDelay = 5000; // 5 seconds
const maxReconnectDelay = 60000; // 1 minute
const maxReconnectAttempts = 5;
let reconnectAttempts = 0;
let reconnectDelay = initialReconnectDelay;
let pingInterval;
let handshakeTimeout;
let locationMonitoringActive = false;
let locationMonitoringInterval;

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [GeminiMessenger] ${message}`);
}

function connect() {
  if (isConnecting) {
    log('Already attempting to connect, skipping redundant connection attempt');
    return;
  }

  console.log('[GeminiMessenger] Attempting to connect to server');
  console.log('[GeminiMessenger] Server URL:', serverUrl);
  console.log('[GeminiMessenger] Port:', port);
  
  if (socket) {
    socket.destroy();
    socket.removeAllListeners();
  }

  isConnecting = true;
  socket = new net.Socket();

  socket.on('connect', () => {
    log('Successfully connected to server');
    isConnected = true;
    isConnecting = false;
    reconnectAttempts = 0;
    reconnectDelay = initialReconnectDelay;
    
    clearTimeout(handshakeTimeout);
    handshakeTimeout = setTimeout(() => {
      sendHandshake();
    }, 1000);
  });

  socket.on('data', (data) => {
    log(`Received data from server: ${data.toString()}`);
    if (data.toString().trim() === 'HANDSHAKE_OK') {
      log('Handshake successful');
      startPing();
    }
  });

  socket.on("close", (hadError) => {
    log(`Disconnected from server. Had error: ${hadError}`, 'warn');
    isConnected = false;
    isConnecting = false;
    clearInterval(pingInterval);
    clearTimeout(handshakeTimeout);
    
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts - 1), maxReconnectDelay);
      log(`Scheduling reconnection attempt ${reconnectAttempts} of ${maxReconnectAttempts} in ${delay}ms`);
      setTimeout(connect, delay);
    } else {
      log('Max reconnection attempts reached. Please check the server connection manually.', 'error');
    }
  });

  socket.on('error', (error) => {
    log(`Socket Error: ${error.message}`, 'error');
  });

  socket.setTimeout(60000, () => {
    if (!isConnected) {
      log('Connection attempt timed out', 'warn');
      socket.destroy();
    }
  });

  socket.connect(port, serverUrl, () => {
    log('Connection established');
  });
}

function sendHandshake() {
  log('Sending handshake');
  socket.write('HANDSHAKE\x04', (err) => {
    if (err) {
      log(`Error sending handshake: ${err.message}`, 'error');
    } else {
      log('Handshake sent successfully');
    }
  });
}

function startPing() {
  clearInterval(pingInterval);
  pingInterval = setInterval(() => {
    if (isConnected) {
      log('Sending PING');
      socket.write('PING\x04', (err) => {
        if (err) {
          log(`Error sending PING: ${err.message}`, 'error');
        } else {
          log('PING sent successfully');
        }
      });
    } else {
      log('Not connected, skipping PING', 'warn');
    }
  }, 30000); // Send a ping every 30 seconds
}

function ensureConnection() {
  return new Promise((resolve, reject) => {
    if (isConnected && socket) {
      resolve();
    } else if (isConnecting) {
      socket.once('connect', () => {
        resolve();
      });
      socket.once('error', (error) => {
        reject(error);
      });
    } else {
      connect();
      socket.once('connect', () => {
        resolve();
      });
      socket.once('error', (error) => {
        reject(error);
      });
    }
  });
}

async function sendMessage(eventCode, phoneNumber, latitude = 0, longitude = 0, altitude = 0, speed = 0, accuracy = 0, bearing = 0, timestamp, preAlarmEnd = '', suffix = '') {
  log(`Preparing to send message: ${eventCode}`);
  try {
    await ensureConnection();
    log('Connection ensured');
    const message = formatMessage(eventCode, phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, timestamp, preAlarmEnd, suffix);
    log(`Formatted message: ${message}`);
    return new Promise((resolve, reject) => {
      socket.write(message + '\x04', (err) => {
        if (err) {
          log(`Error sending message: ${err.message}`, 'error');
          reject(err);
        } else {
          log(`Message sent successfully: ${message}`);
          resolve();
        }
      });
    });
  } catch (error) {
    log(`Failed to send message: ${error.message}`, 'error');
    throw error;
  }
}

function formatMessage(eventCode, phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, timestamp, preAlarmEnd, suffix) {
  const fields = [
    `${eventCodePrefix}${eventCode}`,
    phoneNumber || '+447710777938',
    latitude.toFixed(6),
    longitude.toFixed(6),
    altitude.toFixed(2),
    speed.toFixed(2),
    accuracy.toFixed(0),
    bearing.toFixed(0),
    timestamp || '',
    preAlarmEnd || '',
    suffix || ''
  ];
  return fields.join('|');
}

function getCurrentTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:T]/g, '').split('.')[0];
}

function startLocationMonitoring(phoneNumber) {
  log('Starting location monitoring');
  if (!locationMonitoringActive) {
    locationMonitoringActive = true;
    clearInterval(locationMonitoringInterval);
    locationMonitoringInterval = setInterval(() => {
      if (isConnected) {
        sendMessage('LTI', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
      }
    }, 30000); // Send location every 30 seconds
    log('Location monitoring started');
  }
}

function stopLocationMonitoring() {
  if (locationMonitoringActive) {
    locationMonitoringActive = false;
    clearInterval(locationMonitoringInterval);
    log('Location monitoring stopped');
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { action, phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, preAlarmText } = req.body;

    log(`Received request: ${action}`);

    try {
      switch (action) {
        case 'sendLocatorAppExit':
          await sendMessage('LAF', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
          break;
        case 'sendLocatorAppStart':
          await sendMessage('LAS', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
          break;
        case 'sendLocatorShiftReporting':
          await sendMessage('LCI', phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, getCurrentTimestamp(), '', 'CP');
          break;
        case 'sendLocatorLowPower':
          await sendMessage('LCP', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
          break;
        case 'sendLocatorSmsRequestReply':
          await sendMessage('LDI', phoneNumber, latitude, longitude, 0, 0, 0, 0, getCurrentTimestamp());
          break;
        case 'sendLocatorManDownPreAlarmExpired':
          await sendMessage('LMD', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
          break;
        case 'sendLocatorManDownCancel':
          await sendMessage('LMDC', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
          break;
        case 'sendLocatorPowerOk':
          await sendMessage('LNP', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
          break;
        case 'sendLocatorPreAlarmExtended':
          await sendMessage('LSE', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
          break;
        case 'sendLocatorShiftBegin':
          await sendMessage('LSB', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
          break;
        case 'sendLocatorShiftFinished':
          await sendMessage('LSF', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
          break;
        case 'sendLocatorSingleReport':
          await sendMessage('LTI', phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, getCurrentTimestamp());
          break;
        case 'sendLocatorPreAlarm':
          await sendMessage('LTP', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp(), '', preAlarmText);
          break;
        case 'sendLocatorPreAlarmCancel':
          await sendMessage('LTPC', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
          break;
        case 'sendLocatorAlarmSOS':
          await sendMessage('LTS', phoneNumber, latitude, longitude, 0, 0, 0, 0, getCurrentTimestamp());
          break;
        case 'sendLocatorAlarmCancel':
          await sendMessage('LTSC', phoneNumber, latitude, longitude, 0, 0, 0, 0, getCurrentTimestamp(), '', 'NP');
          break;
        case 'sendLocatorDuressAlert':
          await sendMessage('LUD', phoneNumber, latitude, longitude, 0, 0, 0, 0, getCurrentTimestamp());
          break;
        case 'setLocation':
          currentLocation = { latitude, longitude };
          if (!locationMonitoringActive) {
            startLocationMonitoring(phoneNumber);
          }
          break;
        case 'startLocationMonitoring':
          startLocationMonitoring(phoneNumber);
          break;
        case 'stopLocationMonitoring':
          stopLocationMonitoring();
          break;
        case 'healthCheck':
          res.status(200).json({ status: 'OK', connected: isConnected });
          return;
        case 'reconnect':
          await ensureConnection();
          res.status(200).json({ status: 'OK', connected: isConnected });
          return;
        default:
          res.status(400).json({ error: 'Invalid action' });
          return;
      }

      log(`Successfully processed action: ${action}`);
      res.status(200).json({ success: true });
    } catch (error) {
      log(`Error in handler: ${error.message}`, 'error');
      res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

// Ensure connection is established when the module is imported
ensureConnection().catch(error => {
  log(`Failed to establish initial connection: ${error.message}`, 'error');
});