import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import PreAlarmDialog from '@/components/PreAlarmDialog';
import SOSAlarm from '@/components/SOSAlarm';
import { toast, Toaster } from "sonner";
import { MoreHorizontal, Send, MapPin, Play, Pause, Bell, BellRing, AlertTriangle, Wifi, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useRouter } from 'next/router';

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState('Idle');
  const [isLocationMonitoring, setIsLocationMonitoring] = useState(false);
  const [isPreAlarmDialogOpen, setIsPreAlarmDialogOpen] = useState(false);
  const [isSOSAlarmActive, setIsSOSAlarmActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [isPreAlarmActive, setIsPreAlarmActive] = useState(false);

  useEffect(() => {
    if (isLocationMonitoring) {
      const watchId = navigator.geolocation.watchPosition(
        position => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          // TODO: Send location to server
        },
        error => {
          console.error("Error getting location:", error);
          showToast("Unable to get your location. Please check your settings.", "error");
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isLocationMonitoring]);

  const showToast = (message, type = "default", description = "") => {
    const toastOptions = {
      duration: 2000,
      closeButton: true,
    };

    switch (type) {
      case "success":
        toast.success(message, { ...toastOptions, description });
        break;
      case "error":
        toast.error(message, { ...toastOptions, description });
        break;
      case "info":
        toast.info(message, { ...toastOptions, description });
        break;
      default:
        toast(message, { ...toastOptions, description });
    }
  };

  const toggleLocationMonitoring = () => {
    setIsLocationMonitoring(!isLocationMonitoring);
    setStatus(isLocationMonitoring ? 'Idle' : 'Monitoring');
    showToast(
      isLocationMonitoring ? "Monitoring Stopped" : "Monitoring Started",
      "success",
      isLocationMonitoring ? "Location monitoring has been stopped." : "Your location is now being monitored."
    );
  };

  const handleStartPreAlarm = () => {
    setIsPreAlarmDialogOpen(true);
  };

  const handlePreAlarmStart = () => {
    setIsPreAlarmActive(true);
    // Any other logic for starting the pre-alarm
  };

  const handlePreAlarmEnd = () => {
    setIsPreAlarmActive(false);
    // Any other logic for ending the pre-alarm
  };

  const handleExtendPreAlarm = () => {
    // TODO: Implement extend pre-alarm logic
    showToast("Pre-Alarm Extended", "info", "The pre-alarm duration has been extended.");
  };

  const handleSOSAlarm = () => {
    setIsSOSAlarmActive(true);
    // TODO: Implement server-side SOS alert
    showToast("SOS Alarm Activated", "error", "Emergency services have been notified.");
  };

  const handleSendLocation = () => {
    // TODO: Implement send location logic
    showToast("Location Sent", "success", "Your current location has been sent.");
  };

  const renderButtonContent = (icon, text) => (
    <>
      {icon}
      <span className="mt-2">{text}</span>
    </>
  );

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      showToast("Logout failed. Please try again.", "error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-700 text-white p-4">
      <Toaster richColors />
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Wifi className="w-8 h-8 text-white mr-2" />
          <h1 className="text-2xl font-bold">Gemini Locator</h1>
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            {isLocationMonitoring ? (
              <BellRing className="mr-1 text-green-500 animate-ring" />
            ) : (
              <MapPin className="mr-1 text-gray-500" />
            )}
            <span className={`font-bold ${isLocationMonitoring ? 'text-green-500' : 'text-gray-500'}`}>
              {isLocationMonitoring ? 'On' : 'Off'}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Help</DropdownMenuItem>
              <DropdownMenuItem>About</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-grow flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={toggleLocationMonitoring}
            variant={isLocationMonitoring ? "destructive" : "default"}
            className={`${isLocationMonitoring ? 'bg-green-500 hover:bg-green-600' : 'bg-[#757575] hover:bg-[#656565]'} h-32 flex flex-col items-center justify-center rounded-lg font-bold text-white transition-colors duration-200 shadow-lg`}
          >
            {renderButtonContent(
              isLocationMonitoring ? <Pause className="w-16 h-16 mb-2" /> : <Play className="w-16 h-16 mb-2" />,
              <span className="text-[0.98em]">{isLocationMonitoring ? 'Stop Monitoring' : 'Location Monitoring'}</span>
            )}
          </Button>

          <Button 
            onClick={handleStartPreAlarm} 
            variant="default" 
            className={`${isPreAlarmActive ? 'bg-green-500 hover:bg-green-600' : 'bg-[#757575] hover:bg-[#656565]'} h-32 flex flex-col items-center justify-center rounded-lg font-bold text-white transition-colors duration-200 shadow-lg`}
          >
            {renderButtonContent(<Bell className="w-16 h-16 mb-2" />, <span className="text-[0.98em]">Start Pre-Alarm</span>)}
          </Button>

          <Button 
            onClick={handleExtendPreAlarm} 
            variant="default" 
            className="bg-yellow-500 hover:bg-yellow-600 h-32 flex flex-col items-center justify-center rounded-lg font-bold text-white transition-colors duration-200 shadow-lg"
          >
            {renderButtonContent(<BellRing className="w-16 h-16 mb-2" />, <span className="text-[0.98em]">Extend Pre-Alarm</span>)}
          </Button>

          <Button 
            onClick={handleSendLocation} 
            variant="outline" 
            className="bg-gray-800 hover:bg-gray-700 h-32 flex flex-col items-center justify-center rounded-lg font-bold text-white transition-colors duration-200 shadow-lg"
          >
            {renderButtonContent(<Send className="w-16 h-16 mb-2" />, <span className="text-[0.98em]">Send Location</span>)}
          </Button>

          <Button 
            onClick={handleSOSAlarm} 
            variant="destructive" 
            className="bg-red-500 hover:bg-red-600 h-32 flex flex-col items-center justify-center col-span-2 rounded-lg font-bold text-white transition-colors duration-200 shadow-lg"
          >
            {renderButtonContent(<AlertTriangle className="w-16 h-16 mb-2" />, <span className="text-[0.98em]">SOS Alarm</span>)}
          </Button>
        </div>

        {location && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Current Location</h2>
            <p>Latitude: {location.latitude.toFixed(6)}</p>
            <p>Longitude: {location.longitude.toFixed(6)}</p>
            <p>Timestamp: {new Date().toLocaleString()}</p>
          </div>
        )}
      </main>

      <footer className="mt-8 flex justify-end items-center">
        {/* Remove the existing DropdownMenu from here */}
      </footer>

      <PreAlarmDialog
        open={isPreAlarmDialogOpen}
        onOpenChange={setIsPreAlarmDialogOpen}
        onPreAlarmStart={handlePreAlarmStart}
        onPreAlarmEnd={handlePreAlarmEnd}
      />

      <SOSAlarm
        isActive={isSOSAlarmActive}
        onDeactivate={() => setIsSOSAlarmActive(false)}
      />
    </div>
  );
}