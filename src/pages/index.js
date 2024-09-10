import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import PreAlarmDialog from '@/components/PreAlarmDialog';
import SOSAlarm from '@/components/SOSAlarm';
import { toast, Toaster } from "sonner";
import { MoreHorizontal, Send, MapPin, Play, Pause, Bell, BellRing, AlertTriangle, Wifi } from "lucide-react";
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
    <div className="flex flex-col min-h-screen bg-black text-white p-4">
      <Toaster richColors />
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Wifi className="w-8 h-8 text-white mr-2" />
          <h1 className="text-2xl font-bold">Gemini Locator</h1>
        </div>
        <div className="flex items-center">
          <MapPin className={`mr-1 ${isLocationMonitoring ? 'text-green-500' : 'text-gray-500'}`} />
          <span className={`font-bold ${isLocationMonitoring ? 'text-green-500' : 'text-gray-500'}`}>
            {isLocationMonitoring ? 'On' : 'Off'}
          </span>
        </div>
      </header>

      <main className="flex-grow flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={toggleLocationMonitoring}
            variant={isLocationMonitoring ? "destructive" : "default"}
            className={`${isLocationMonitoring ? 'bg-red-500' : 'bg-green-500'} h-32 text-lg flex flex-col items-center justify-center rounded-lg font-bold text-white`}
          >
            {renderButtonContent(
              isLocationMonitoring ? <Pause className="w-20 h-20 mb-2" /> : <Play className="w-20 h-20 mb-2" />,
              isLocationMonitoring ? 'Stop Monitoring' : 'Start Monitoring'
            )}
          </Button>

          <Button 
            onClick={handleStartPreAlarm} 
            variant="default" 
            className="bg-blue-500 h-32 text-lg flex flex-col items-center justify-center rounded-lg font-bold text-white"
          >
            {renderButtonContent(<Bell className="w-20 h-20 mb-2" />, 'Start Pre-Alarm')}
          </Button>

          <Button 
            onClick={handleExtendPreAlarm} 
            variant="default" 
            className="bg-yellow-500 h-32 text-lg flex flex-col items-center justify-center rounded-lg font-bold text-white"
          >
            {renderButtonContent(<BellRing className="w-20 h-20 mb-2" />, 'Extend Pre-Alarm')}
          </Button>

          <Button 
            onClick={handleSendLocation} 
            variant="outline" 
            className="bg-gray-800 h-32 text-lg flex flex-col items-center justify-center rounded-lg font-bold text-white"
          >
            {renderButtonContent(<Send className="w-20 h-20 mb-2" />, 'Send Location')}
          </Button>

          <Button 
            onClick={handleSOSAlarm} 
            variant="destructive" 
            className="bg-red-500 h-32 text-lg flex flex-col items-center justify-center col-span-2 rounded-lg font-bold text-white"
          >
            {renderButtonContent(<AlertTriangle className="w-20 h-20 mb-2" />, 'SOS Alarm')}
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
        <Button onClick={handleLogout} variant="ghost">Logout</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-gray-800">
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