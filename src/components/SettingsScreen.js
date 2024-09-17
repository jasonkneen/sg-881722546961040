import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const SettingsScreen = ({ onClose }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState('high');

  const handleToggle = (setter) => () => setter(prev => !prev);

  const handleLocationAccuracyChange = (e) => setLocationAccuracy(e.target.value);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-700 p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="h-6 w-6 text-white" />
          </Button>
        </div>
        <div className="text-white">
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={handleToggle(setNotificationsEnabled)}
                className="mr-2"
              />
              Enable Notifications
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={darkModeEnabled}
                onChange={handleToggle(setDarkModeEnabled)}
                className="mr-2"
              />
              Dark Mode
            </label>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Location Accuracy</label>
            <select
              value={locationAccuracy}
              onChange={handleLocationAccuracyChange}
              className="w-full p-2 bg-gray-600 rounded"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <Button onClick={onClose} className="w-full bg-blue-500 hover:bg-blue-600">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;