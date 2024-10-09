import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { toast } from 'sonner';

const GeminiMessenger = forwardRef((props, ref) => {
  const [isConnected, setIsConnected] = useState(false);

  const sendRequest = async (action, data) => {
    console.log(`[GeminiMessenger] Sending request: ${action}`, data);
    try {
      const response = await fetch('/api/geminiMessenger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...data }),
      });
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      console.log(`[GeminiMessenger] Response for ${action}:`, result);
      return result;
    } catch (error) {
      console.error(`[GeminiMessenger] Error in ${action}:`, error);
      toast.error(`Failed to send ${action}: ${error.message}`);
      throw error;
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await sendRequest('healthCheck');
      setIsConnected(response.connected);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const reconnect = async () => {
    try {
      await sendRequest('reconnect');
      await checkConnectionStatus();
      if (isConnected) {
        console.log('[GeminiMessenger] Reconnection successful');
        return true;
      } else {
        throw new Error('Failed to reconnect');
      }
    } catch (error) {
      console.error('[GeminiMessenger] Reconnection failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkConnectionStatus();
    const intervalId = setInterval(checkConnectionStatus, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, []);

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
    isConnected: () => isConnected,
    reconnect: reconnect,
  }));

  return null;
});

export default GeminiMessenger;