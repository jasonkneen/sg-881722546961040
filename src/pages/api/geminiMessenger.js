import net from 'net';

let socket = null;
let isConnected = false;
let currentLocation = { latitude: 0, longitude: 0 };
const eventCodePrefix = '';
const serverUrl = '213.171.203.19';
const port = 8000;

function connect() {
  console.log('Connecting to server');
  console.log('Server URL:', serverUrl);
  console.log('Port:', port);
  
  socket = new net.Socket();

  socket.on('data', (data) => {
    console.log('Received:', data.toString());
  });

  socket.on('close', () => {
    isConnected = false;
    console.log('Disconnected from server');
  });

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

function sendMessage(eventCode, phoneNumber, latitude = 0, longitude = 0, altitude = 0, speed = 0, accuracy = 0, bearing = 0, timestamp, preAlarmEnd = '', suffix = '') {
  if (!isConnected || !socket) {
    console.error('Cannot send message: Not connected');
    return;
  }

  const message = formatMessage(eventCode, phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, timestamp, preAlarmEnd, suffix);
  socket.write(message + '\x04');
  console.log('Sent:', message);
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

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { action, phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, preAlarmText } = req.body;

    switch (action) {
      case 'sendLocatorAppExit':
        sendMessage('LAF', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
        break;
      case 'sendLocatorAppStart':
        sendMessage('LAS', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
        break;
      case 'sendLocatorShiftReporting':
        sendMessage('LCI', phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, getCurrentTimestamp(), '', 'CP');
        break;
      case 'sendLocatorLowPower':
        sendMessage('LCP', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
        break;
      case 'sendLocatorSmsRequestReply':
        sendMessage('LDI', phoneNumber, latitude, longitude, 0, 0, 0, 0, getCurrentTimestamp());
        break;
      case 'sendLocatorManDownPreAlarmExpired':
        sendMessage('LMD', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
        break;
      case 'sendLocatorManDownCancel':
        sendMessage('LMDC', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
        break;
      case 'sendLocatorPowerOk':
        sendMessage('LNP', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
        break;
      case 'sendLocatorPreAlarmExtended':
        sendMessage('LSE', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
        break;
      case 'sendLocatorShiftBegin':
        sendMessage('LSB', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
        break;
      case 'sendLocatorShiftFinished':
        sendMessage('LSF', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
        break;
      case 'sendLocatorSingleReport':
        sendMessage('LTI', phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing, getCurrentTimestamp());
        break;
      case 'sendLocatorPreAlarm':
        sendMessage('LTP', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp(), '', preAlarmText);
        break;
      case 'sendLocatorPreAlarmCancel':
        sendMessage('LTPC', phoneNumber, currentLocation.latitude, currentLocation.longitude, 0, 0, 0, 0, getCurrentTimestamp());
        break;
      case 'sendLocatorAlarmSOS':
        sendMessage('LTS', phoneNumber, latitude, longitude, 0, 0, 0, 0, getCurrentTimestamp());
        break;
      case 'sendLocatorAlarmCancel':
        sendMessage('LTSC', phoneNumber, latitude, longitude, 0, 0, 0, 0, getCurrentTimestamp(), '', 'NP');
        break;
      case 'sendLocatorDuressAlert':
        sendMessage('LUD', phoneNumber, latitude, longitude, 0, 0, 0, 0, getCurrentTimestamp());
        break;
      case 'setLocation':
        currentLocation = { latitude, longitude };
        break;
      default:
        res.status(400).json({ error: 'Invalid action' });
        return;
    }

    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}