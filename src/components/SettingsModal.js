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
import { Loader } from "lucide-react";

const SettingsModal = ({ isOpen, onClose }) => {
  const [visibleSettings, setVisibleSettings] = useState({
    requirePinOnStopAlarm: true,
    version: true,
    phoneNumber: true,
    // Add more settings visibility flags as needed
  });
  const [combinedSettings, setCombinedSettings] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const setupResponse = await fetch('/Bold.Setup.API.json');
        const userResponse = await fetch('/Bold.User.API.json');

        if (!setupResponse.ok || !userResponse.ok) {
          throw new Error('Failed to fetch settings data');
        }

        const setupData = await setupResponse.json();
        const userData = await userResponse.json();

        const combinedData = {
          ...setupData,
          ...userData,
          requirePinOnStopAlarm: setupData.requirePinOnStopAlarm || false,
          version: setupData.info.version,
          phoneNumber: userData.phoneNumber || '',
          primaryReceiver: userData.primaryReceiver || '',
          connectionTimeoutMilliseconds: setupData.connectionTimeoutMilliseconds || 5000,
          normalLocationReportPeriodSeconds: setupData.normalLocationReportPeriodSeconds || 60,
        };

        setCombinedSettings(combinedData);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const toggleSettingVisibility = (settingId) => {
    setVisibleSettings(prev => ({
      ...prev,
      [settingId]: !prev[settingId],
    }));
  };

  const handleSettingChange = (settingId, value) => {
    setCombinedSettings(prev => ({
      ...prev,
      [settingId]: value,
    }));
  };

  const handleSave = () => {
    // Here you would typically send the updated settings to your backend
    console.log('Saving settings:', combinedSettings);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-y-auto max-h-[80vh] bg-gray-900 p-4 rounded-lg">
        <Card className="bg-transparent shadow-none mt-12 border-none">
          <CardContent className="bg-transparent p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader className="w-8 h-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-red-500 mb-4">{error}</div>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                <AccordionItem value="account-settings">
                  <AccordionTrigger>Account Settings</AccordionTrigger>
                  <AccordionContent>
                    {visibleSettings.requirePinOnStopAlarm && (
                      <div className="mb-4">
                        <label htmlFor="requirePinOnStopAlarm" className="block text-sm font-medium text-gray-400">
                          Require PIN on Stop Alarm
                        </label>
                        <Checkbox
                          id="requirePinOnStopAlarm"
                          checked={combinedSettings.requirePinOnStopAlarm}
                          onCheckedChange={(checked) => handleSettingChange('requirePinOnStopAlarm', checked)}
                        />
                      </div>
                    )}
                    {visibleSettings.phoneNumber && (
                      <div className="mb-4">
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-400">
                          Phone Number
                        </label>
                        <Input
                          id="phoneNumber"
                          value={combinedSettings.phoneNumber || ''}
                          onChange={(e) => handleSettingChange('phoneNumber', e.target.value)}
                          className="gray-200"
                        />
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="application-info">
                  <AccordionTrigger>Application Info</AccordionTrigger>
                  <AccordionContent>
                    {visibleSettings.version && (
                      <div className="mb-4">
                        <label htmlFor="version" className="block text-sm font-medium text-gray-400">
                          Version
                        </label>
                        <Input
                          id="version"
                          value={combinedSettings.version || ''}
                          readOnly
                          className="gray-200"
                        />
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="alarm-settings">
                  <AccordionTrigger>Alarm Settings</AccordionTrigger>
                  <AccordionContent>
                    <div className="mb-4">
                      <label htmlFor="primaryReceiver" className="block text-sm font-medium text-gray-400">
                        Primary Receiver
                      </label>
                      <Input
                        id="primaryReceiver"
                        value={combinedSettings.primaryReceiver || ''}
                        onChange={(e) => handleSettingChange('primaryReceiver', e.target.value)}
                        className="gray-200"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="connectionTimeout" className="block text-sm font-medium text-gray-400">
                        Connection Timeout (ms)
                      </label>
                      <Input
                        id="connectionTimeout"
                        type="number"
                        value={combinedSettings.connectionTimeoutMilliseconds || ''}
                        onChange={(e) => handleSettingChange('connectionTimeoutMilliseconds', parseInt(e.target.value))}
                        className="gray-200"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="locationReportPeriod" className="block text-sm font-medium text-gray-400">
                        Normal Location Report Period (s)
                      </label>
                      <Input
                        id="locationReportPeriod"
                        type="number"
                        value={combinedSettings.normalLocationReportPeriodSeconds || ''}
                        onChange={(e) => handleSettingChange('normalLocationReportPeriodSeconds', parseInt(e.target.value))}
                        className="gray-200"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

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
                    <label htmlFor={`toggle-${settingId}`} className="ml-2 text-sm text-gray-400 capitalize">
                      {settingId.replace(/([A-Z])/g, ' $1')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-right border-t border-gray-800 pt-4 flex justify-end space-x-4">
              <Button variant="secondary" className="w-1/2" onClick={onClose}>Cancel</Button>
              <Button variant="default" className="w-1/2" onClick={handleSave}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;