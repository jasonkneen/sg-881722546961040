import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import PreAlarmDialog from '@/components/PreAlarmDialog';
import SOSAlarm from '@/components/SOSAlarm';
import { toast, Toaster } from "sonner";
import { MoreHorizontal, Send, Battery } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState('Idle');
  const [isLocationMonitoring, setIsLocationMonitoring] = useState(false);
  const [isPreAlarmDialogOpen, setIsPreAlarmDialogOpen] = useState(false);
  const [isSOSAlarmActive, setIsSOSAlarmActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({ status: 'Connected', percentage: 75 });

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4">
      <Toaster richColors />
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gemini Locator</h1>
        <div className="flex items-center">
          <Battery className="mr-2" />
          <span className={`font-bold ${connectionStatus.status === 'Connected' ? 'text-green-500' : 'text-red-500'}`}>
            {connectionStatus.status} ({connectionStatus.percentage}%)
          </span>
        </div>
      </header>

      <main className="flex-grow flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={toggleLocationMonitoring}
            variant={isLocationMonitoring ? "destructive" : "default"}
            className={isLocationMonitoring ? "bg-gray-500" : "bg-green-500"}
          >
            {isLocationMonitoring ? 'Stop Monitoring' : 'Shift Monitoring'}
          </Button>

          <Button onClick={handleStartPreAlarm} variant="default" className="bg-blue-500">
            Start Pre-Alarm
          </Button>

          <Button onClick={handleExtendPreAlarm} variant="default" className="bg-yellow-500">
            Extend Pre-Alarm
          </Button>

          <Button onClick={handleSOSAlarm} variant="destructive" className="bg-red-500">
            SOS Alarm
          </Button>

          <Button onClick={handleSendLocation} variant="outline" className="bg-gray-700">
            <Send className="mr-2 h-4 w-4" /> Send Location
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
        onOpenChange={setIsPreAlarmDialogOpen}
      />

      <SOSAlarm
        isActive={isSOSAlarmActive}
        onDeactivate={() => setIsSOSAlarmActive(false)}
      />
    </div>
  );
}