import React, { forwardRef, useImperativeHandle } from 'react';

const GeminiMessenger = forwardRef((props, ref) => {
  const sendRequest = async (action, data) => {
    try {
      const response = await fetch('/api/geminiMessenger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...data }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useImperativeHandle(ref, () => ({
    sendLocatorAppExit: (phoneNumber) => sendRequest('sendLocatorAppExit', { phoneNumber }),
    sendLocatorAppStart: (phoneNumber) => sendRequest('sendLocatorAppStart', { phoneNumber }),
    sendLocatorShiftReporting: (phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing) => 
      sendRequest('sendLocatorShiftReporting', { phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing }),
    sendLocatorLowPower: (phoneNumber) => sendRequest('sendLocatorLowPower', { phoneNumber }),
    sendLocatorSmsRequestReply: (phoneNumber, latitude, longitude) => 
      sendRequest('sendLocatorSmsRequestReply', { phoneNumber, latitude, longitude }),
    sendLocatorManDownPreAlarmExpired: (phoneNumber) => sendRequest('sendLocatorManDownPreAlarmExpired', { phoneNumber }),
    sendLocatorManDownCancel: (phoneNumber) => sendRequest('sendLocatorManDownCancel', { phoneNumber }),
    sendLocatorPowerOk: (phoneNumber) => sendRequest('sendLocatorPowerOk', { phoneNumber }),
    sendLocatorPreAlarmExtended: (phoneNumber) => sendRequest('sendLocatorPreAlarmExtended', { phoneNumber }),
    sendLocatorShiftBegin: (phoneNumber) => sendRequest('sendLocatorShiftBegin', { phoneNumber }),
    sendLocatorShiftFinished: (phoneNumber) => sendRequest('sendLocatorShiftFinished', { phoneNumber }),
    sendLocatorSingleReport: (phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing) => 
      sendRequest('sendLocatorSingleReport', { phoneNumber, latitude, longitude, altitude, speed, accuracy, bearing }),
    sendLocatorPreAlarm: (phoneNumber, preAlarmText) => sendRequest('sendLocatorPreAlarm', { phoneNumber, preAlarmText }),
    sendLocatorPreAlarmCancel: (phoneNumber) => sendRequest('sendLocatorPreAlarmCancel', { phoneNumber }),
    sendLocatorAlarmSOS: (phoneNumber, latitude, longitude) => 
      sendRequest('sendLocatorAlarmSOS', { phoneNumber, latitude, longitude }),
    sendLocatorAlarmCancel: (phoneNumber, latitude, longitude) => 
      sendRequest('sendLocatorAlarmCancel', { phoneNumber, latitude, longitude }),
    sendLocatorDuressAlert: (phoneNumber, latitude, longitude) => 
      sendRequest('sendLocatorDuressAlert', { phoneNumber, latitude, longitude }),
    setLocation: (latitude, longitude) => sendRequest('setLocation', { latitude, longitude }),
  }));

  return null;
});

export default GeminiMessenger;