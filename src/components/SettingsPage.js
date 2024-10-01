import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const SettingsPage = () => {
  const [visibleSettings, setVisibleSettings] = useState({
    requirePinOnStopAlarm: true,
    version: true,
    // Add more settings visibility flags as needed
  });
  const [combinedSettings, setCombinedSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const setupResponse = await fetch('/settings/Bold.Setup.API.json');
        const setupData = await setupResponse.json();

        const userResponse = await fetch('/settings/Bold.User.API.json');
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
    <div className="p-6 min-h-screen">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <h2 className="text-2xl font-bold">Settings</h2>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-2">
            {/* Example Group: Account Settings */}
            <AccordionItem value="account-settings">
              <AccordionTrigger>Account Settings</AccordionTrigger>
              <AccordionContent>
                {visibleSettings.requirePinOnStopAlarm && combinedSettings.requirePinOnStopAlarm && (
                  <div className="mb-4">
                    <label htmlFor="requirePinOnStopAlarm" className="block text-sm font-medium text-gray-700">
                      Require PIN on Stop Alarm
                    </label>
                    <Checkbox
                      id="requirePinOnStopAlarm"
                      checked={combinedSettings.requirePinOnStopAlarm}
                      onCheckedChange={(checked) => {
                        // Handle the change (e.g., update state or make API call)
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
                    <label htmlFor="version" className="block text-sm font-medium text-gray-700">
                      Version
                    </label>
                    <Input
                      id="version"
                      value={combinedSettings.version}
                      readOnly
                      className="bg-gray-200"
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
                  <label htmlFor={`toggle-${settingId}`} className="ml-2 text-sm text-gray-700 capitalize">
                    {settingId.replace(/([A-Z])/g, ' $1')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Save Settings Button */}
          <div className="mt-6">
            <Button variant="primary">Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;