import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation('common');
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
          throw new Error(t('settings.fetchError'));
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
        setError(t('settings.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen, t]);

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
                  <AccordionTrigger>{t('settings.accountSettings')}</AccordionTrigger>
                  <AccordionContent>
                    {visibleSettings.requirePinOnStopAlarm && (
                      <div className="mb-4">
                        <label htmlFor="requirePinOnStopAlarm" className="block text-sm font-medium text-gray-400">
                          {t('settings.requirePinOnStopAlarm')}
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
                          {t('settings.phoneNumber')}
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
                  <AccordionTrigger>{t('settings.applicationInfo')}</AccordionTrigger>
                  <AccordionContent>
                    {visibleSettings.version && (
                      <div className="mb-4">
                        <label htmlFor="version" className="block text-sm font-medium text-gray-400">
                          {t('settings.version')}
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
                  <AccordionTrigger>{t('settings.alarmSettings')}</AccordionTrigger>
                  <AccordionContent>
                    <div className="mb-4">
                      <label htmlFor="primaryReceiver" className="block text-sm font-medium text-gray-400">
                        {t('settings.primaryReceiver')}
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
                        {t('settings.connectionTimeout')}
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
                        {t('settings.locationReportPeriod')}
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
              <h3 className="text-xl font-semibold mb-2">{t('settings.customizeVisibility')}</h3>
              <div className="space-y-2">
                {Object.keys(visibleSettings).map((settingId) => (
                  <div key={settingId} className="flex items-center">
                    <Checkbox
                      id={`toggle-${settingId}`}
                      checked={visibleSettings[settingId]}
                      onCheckedChange={() => toggleSettingVisibility(settingId)}
                    />
                    <label htmlFor={`toggle-${settingId}`} className="ml-2 text-sm text-gray-400 capitalize">
                      {t(`settings.${settingId}`)}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-right border-t border-gray-800 pt-4 flex justify-end space-x-4">
              <Button variant="secondary" className="w-1/2" onClick={onClose}>{t('buttons.cancel')}</Button>
              <Button variant="default" className="w-1/2" onClick={handleSave}>{t('buttons.save')}</Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;