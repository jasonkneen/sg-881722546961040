import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SettingsModal = ({ isOpen, onClose }) => {
  const [visibleSettings, setVisibleSettings] = useState({
    requirePinOnStopAlarm: true,
    version: true,
    // Add more settings visibility flags as needed
  });
  const [combinedSettings, setCombinedSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const setupResponse = await fetch('/data/Bold.Setup.API.json');
        const setupData = await setupResponse.json();

        const userResponse = await fetch('/data/Bold.User.API.json');
        const userData = await userResponse.json();

        setCombinedSettings({ ...setupData, ...userData });
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Function to toggle visibility of a setting
  const toggleSettingVisibility = (settingId) => {
    setVisibleSettings(prev => ({
      ...prev,
      [settingId]: !prev[settingId],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} onClose={onClose}> {/* Removed close button */}
      <DialogContent className="overflow-y-auto max-h-[80vh] bg-gray-900 p-4 rounded-lg "> {/* Make background transparent */}
        <Card className="bg-transparent shadow-none mt-12 border-none"> {/* Set card background to transparent, remove border */}
          <CardContent className="bg-transparent p-0"> {/* Set content background to transparent, remove padding */}
            <Accordion type="multiple" className="space-y-4">
              {/* Example Group: Account Settings */}
              <AccordionItem value="account-settings">
                <AccordionTrigger>Account Settings</AccordionTrigger>
                <AccordionContent>
                  {visibleSettings.requirePinOnStopAlarm && combinedSettings.requirePinOnStopAlarm !== undefined && (
                    <div className="mb-4">
                      <label htmlFor="requirePinOnStopAlarm" className="block text-sm font-medium text-gray-400"> {/* Lighter text color */}
                        Require PIN on Stop Alarm
                      </label>
                      <Checkbox
                        id="requirePinOnStopAlarm"
                        checked={combinedSettings.requirePinOnStopAlarm}
                        onCheckedChange={(checked) => {
                          // Handle the change (e.g., update state or make API call)
                          setCombinedSettings(prev => ({
                            ...prev,
                            requirePinOnStopAlarm: checked,
                          }));
                        }}
                      />
                    </div>
                  )}
                  {/* Add more account-related settings here */}
                </AccordionContent>
              </AccordionItem>

              {/* Example Group: Application Info */}
              <AccordionItem value="application-info">
                <AccordionTrigger>Application Info</AccordionTrigger>
                <AccordionContent>
                  {visibleSettings.version && (
                    <div className="mb-4">
                      <label htmlFor="version" className="block text-sm font-medium text-gray-400"> {/* Lighter text color */}
                        Version
                      </label>
                      <Input
                        id="version"
                        value={combinedSettings.version || '0.5.0'}
                        readOnly
                        className="gray-200"
                      />
                    </div>
                  )}
                  {/* Add more info-related settings here */}
                </AccordionContent>
              </AccordionItem>

              {/* Add more groups as needed */}
            </Accordion>

            {/* Controls to Toggle Visibility of Settings */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Customize Settings Visibility</h3>
              <div className="space-y-2">
                {Object.keys(visibleSettings).map((settingId) => (
                  <div key={settingId} className="flex items-center">
                    <Checkbox
                      id={`toggle-${settingId}`}
                      checked={visibleSettings[settingId]}
                      onCheckedChange={() => toggleSettingVisibility(settingId)}
                    />
                    <label htmlFor={`toggle-${settingId}`} className="ml-2 text-sm text-gray-400 capitalize"> {/* Lighter text color */}
                      {settingId.replace(/([A-Z])/g, ' $1')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Save and Cancel Buttons */}
            <div className="mt-6 text-right border-t border-gray-800 pt-4 flex justify-end space-x-4"> {/* Added flex and spacing */}
               
              <button className="btn btn-secondary px-4 py-2 border-2 rounded-lg w-full" onClick={onClose}>Cancel</button> {/* Updated button styling */}
              <button className="btn btn-primary px-4 py-2 border-2 rounded-lg w-full" onClick={onClose}>Save</button> {/* Updated button styling */}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;