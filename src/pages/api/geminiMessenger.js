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

function connect() {
  if (isConnecting) {
    console.log('Already attempting to connect, skipping redundant connection attempt');
    return;
  }

  console.log('Connecting to server');
  console.log('Server URL:', serverUrl);
  console.log('Port:', port);
  
  if (socket) {
    socket.destroy();
  }

  isConnecting = true;
  socket = new net.Socket();

  socket.on('data', (data) => {
    console.log('Received:', data.toString());
  });

  socket.on("close", (hadError) => {
    isConnected = false;
    isConnecting = false;
    console.log(`Disconnected from server. Had error: ${hadError}`);
    clearInterval(pingInterval);
    
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      console.log(`Reconnection attempt ${reconnectAttempts} of ${maxReconnectAttempts}`);
      setTimeout(connect, reconnectDelay);
      // Implement exponential backoff
      reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
    } else {
      console.error('Max reconnection attempts reached. Please check the server.');
    }
  });

  socket.on('error', (error) => {
    console.error('Socket Error:', error.message);
    isConnected = false;
    isConnecting = false;
  });

  socket.setTimeout(60000, () => {
    if (!isConnected) {
      console.log('Connection timed out');
      socket.destroy();
    }
  });

  socket.connect(port, serverUrl, () => {
    isConnected = true;
    isConnecting = false;
    reconnectAttempts = 0;
    reconnectDelay = initialReconnectDelay;
    console.log('Connected to server');
    //startPing();
  });
}

function startPing() {
  clearInterval(pingInterval);
  pingInterval = setInterval(() => {
    if (isConnected) {
      console.log('Sending PING');
      socket.write('PING\x04');
    } else {
      console.log('Not connected, skipping PING');
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
  try {
    await ensureConnection();
    const message = formatMessage(eventCode, phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, timestamp, preAlarmEnd, suffix);
    socket.write(message + '\x04');
    console.log('Sent:', message);
  } catch (error) {
    console.error('Failed to send message:', error.message);
    throw error; // Rethrow the error to be handled by the caller
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

// Connect when the server starts
connect();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { action, phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, preAlarmText } = req.body;

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
          break;
        default:
          res.status(400).json({ error: 'Invalid action' });
          return;
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error in handler:', error);
      res.status(500).json({ error: 'Failed to process request', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}