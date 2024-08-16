import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import PreAlarmDialog from '@/components/PreAlarmDialog';
import SOSAlarm from '@/components/SOSAlarm';
import { toast, Toaster } from "sonner";
import { MoreHorizontal, Send, Battery, MapPin, Play, Pause, Bell, BellRing, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AIChatHistory from '@/components/Ref'; // Import the AIChatHistory component

export default function Home() {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState('IDLE');
  const [isLocationMonitoring, setIsLocationMonitoring] = useState(false);
  const [isPreAlarmDialogOpen, setIsPreAlarmDialogOpen] = useState(false);
  const [isSOSAlarmActive, setIsSOSAlarmActive] = useState(false);
  const [isPreAlarmActive, setIsPreAlarmActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(75);

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

  useEffect(() => {
    // Simulating battery level updates
    const interval = setInterval(() => {
      setBatteryLevel(prevLevel => Math.max(0, Math.min(100, prevLevel + Math.floor(Math.random() * 5) - 2)));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
    setStatus(isLocationMonitoring ? 'IDLE' : 'MONITORING');
    showToast(
      isLocationMonitoring ? "Monitoring Stopped" : "Monitoring Started",
      "success",
      isLocationMonitoring ? "Location monitoring has been stopped." : "Your location is now being monitored."
    );
  };

  const handlePreAlarm = () => {
    if (isPreAlarmActive) {
      // Stop Pre-Alarm
      setIsPreAlarmActive(false);
      setStatus(isLocationMonitoring ? 'MONITORING' : 'IDLE');
      showToast("Pre-Alarm Stopped", "info", "The pre-alarm has been deactivated.");
    } else {
      // Open Pre-Alarm Dialog
      setIsPreAlarmDialogOpen(true);
    }
  };

  const handlePreAlarmConfirm = (endTime) => {
    // This function will be called when the user confirms in the PreAlarmDialog
    setIsPreAlarmActive(true);
    setStatus('PRE-ALARM');
    setIsPreAlarmDialogOpen(false);
    showToast("Pre-Alarm Started", "info", `The pre-alarm has been activated until ${endTime}.`);
  };

  const handleExtendPreAlarm = () => {
    // TODO: Implement extend pre-alarm logic
    showToast("Pre-Alarm Extended", "info", "The pre-alarm duration has been extended.");
  };

  const handleSOSAlarm = () => {
    setIsSOSAlarmActive(true);
    setStatus('SOS');
    // TODO: Implement server-side SOS alert
    showToast("SOS Alarm Activated", "error", "Emergency services have been notified.");
  };

  const handleSendLocation = () => {
    if (location) {
      // TODO: Implement send location logic
      showToast("Location Sent", "success", "Your current location has been sent.");
    } else {
      showToast("Location Unavailable", "error", "Unable to send location. Please ensure location monitoring is enabled.");
    }
  };

  const renderButtonContent = (icon, text) => (
    <>
      {icon}
      <span className="mt-2">{text}</span>
    </>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4">
      <Toaster richColors />
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gemini Locator</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Battery className="mr-1" />
            <span className="font-bold">{batteryLevel}%</span>
          </div>
          <div className="flex items-center">
            <MapPin className={`mr-1 ${isLocationMonitoring ? 'text-green-500' : 'text-gray-500'}`} />
            <span className={`font-bold ${isLocationMonitoring ? 'text-green-500' : 'text-gray-500'}`}>
              {isLocationMonitoring ? 'On' : 'Off'}
            </span>
          </div>
        </div>
      </header>

      {/* New Status Bar */}
      <div className={`w-full p-4 mb-4 text-center text-2xl font-bold rounded-lg ${
        status === 'IDLE' ? 'bg-gray-700' :
        status === 'MONITORING' ? 'bg-green-600' :
        status === 'PRE-ALARM' ? 'bg-yellow-600' :
        status === 'SOS' ? 'bg-red-600' : 'bg-gray-700'
      }`}>
        {status}
      </div>

      <main className="flex-grow flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={toggleLocationMonitoring}
            variant={isLocationMonitoring ? "destructive" : "default"}
            className={`${isLocationMonitoring ? 'bg-gray-500' : 'bg-green-500'} h-32 text-lg flex flex-col items-center justify-center`}
          >
            {renderButtonContent(
              isLocationMonitoring ? <Pause className="w-12 h-12 mb-2" /> : <Play className="w-16 h-16 mb-2" />,
              isLocationMonitoring ? 'Stop Monitoring' : 'Shift Monitoring'
            )}
          </Button>

          <Button 
            onClick={handlePreAlarm} 
            variant={isPreAlarmActive ? "destructive" : "default"}
            className={`${isPreAlarmActive ? 'bg-red-500' : 'bg-blue-500'} h-32 text-lg flex flex-col items-center justify-center`}
          >
            {renderButtonContent(
              isPreAlarmActive ? <BellRing className="w-16 h-16 mb-2" /> : <Bell className="w-16 h-16 mb-2" />,
              isPreAlarmActive ? 'Stop Pre-Alarm' : 'Set Pre-Alarm'
            )}
          </Button>

          <Button 
            onClick={handleExtendPreAlarm} 
            variant="default" 
            className="bg-yellow-500 h-32 text-lg flex flex-col items-center justify-center"
          >
            {renderButtonContent(<BellRing className="w-16 h-16 mb-2" />, 'Extend Pre-Alarm')}
          </Button>

          <Button 
            onClick={handleSOSAlarm} 
            variant="destructive" 
            className="bg-red-500 h-32 text-lg flex flex-col items-center justify-center"
          >
            {renderButtonContent(<AlertTriangle className="w-16 h-16 mb-2" />, 'SOS Alarm')}
          </Button>

          <Button 
            onClick={handleSendLocation} 
            variant="outline" 
            className="bg-gray-700 h-32 text-lg flex flex-col items-center justify-center col-span-2"
            disabled={!isLocationMonitoring}
          >
            {renderButtonContent(<Send className="w-16 h-16 mb-2" />, 'Send Location')}
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

      <footer className="mt-8 flex justify-between items-center">
        <Button onClick={logout} variant="ghost">Logout</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-gray-700">
              <MoreHorizontal className="mr-2 h-4 w-4" /> More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Help</DropdownMenuItem>
            <DropdownMenuItem>About</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </footer>

      <PreAlarmDialog
        open={isPreAlarmDialogOpen}
        onOpenChange={(open) => {
          setIsPreAlarmDialogOpen(open);
          if (!open && !isPreAlarmActive) {
            // Only reset status if dialog is closed without activating pre-alarm
            setStatus(isLocationMonitoring ? 'MONITORING' : 'IDLE');
          }
        }}
        onConfirm={handlePreAlarmConfirm}
      />

      <SOSAlarm
        isActive={isSOSAlarmActive}
        onDeactivate={() => {
          setIsSOSAlarmActive(false);
          setStatus(isLocationMonitoring ? 'MONITORING' : 'IDLE');
        }}
      />

      {/* AIChatHistory component */}
      <AIChatHistory />
    </div>
  );
}