import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import PreAlarmDialog from '@/components/PreAlarmDialog';
import SOSAlarm from '@/components/SOSAlarm';
import { toast, Toaster } from "sonner";
import { MoreHorizontal, Send, MapPin, Play, Pause, Bell, BellRing, AlertTriangle, Wifi, Menu, Loader } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/router';
import GeminiMessenger from '@/components/GeminiMessenger';

export default function Home() {
  const { user, logout } = useAuth(); 
  const router = useRouter();
  const [status, setStatus] = useState('Idle');
  const [isLocationMonitoring, setIsLocationMonitoring] = useState(false);
  const [isPreAlarmDialogOpen, setIsPreAlarmDialogOpen] = useState(false);
  const [isSOSAlarmActive, setIsSOSAlarmActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [isPreAlarmActive, setIsPreAlarmActive] = useState(false);
  const [preAlarmTimeRemaining, setPreAlarmTimeRemaining] = useState(null);
  const messengerRef = useRef(null);

  useEffect(() => {
    if (user && !user.phoneNumber) {
      toast.error("Please add a phone number to your account to use this app.");
      router.push('/login');
    }
  }, [user, router]);

  const handlePreAlarmStart = (duration, details) => {
    console.log("handlePreAlarmStart called with duration:", duration, "and details:", details);
    setIsPreAlarmDialogOpen(false);
    setIsPreAlarmActive(true);
    setPreAlarmTimeRemaining(duration * 60); // Set time remaining in seconds

    // Send pre-alarm message via GeminiMessenger
    if (messengerRef.current && user && user.phoneNumber) {
      messengerRef.current.sendLocatorPreAlarm(user.phoneNumber, `PreAlarm started for ${duration} minutes. Details: ${details}`);
    } else {
      console.error("Unable to send pre-alarm message: user or phone number not available");
      showToast("Unable to send pre-alarm message", "error", "Please ensure you're logged in and have a valid phone number.");
    }
  };  

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
    const newMonitoringState = !isLocationMonitoring;
    setIsLocationMonitoring(newMonitoringState);
    setStatus(newMonitoringState ? 'Monitoring' : 'Idle');
    showToast(
      newMonitoringState ? "Monitoring Started" : "Monitoring Stopped",
      "success",
      newMonitoringState ? "Your location is now being monitored." : "Location monitoring has been stopped."
    );

    // Send appropriate message via GeminiMessenger
    if (messengerRef.current && user && user.phoneNumber) {
      const phoneNumber = user.phoneNumber;
      if (newMonitoringState) {
        messengerRef.current.sendLocatorAppStart(phoneNumber);
        // Send initial location if available
        if (location) {
          messengerRef.current.sendLocatorSingleReport(
            phoneNumber, 
            location.latitude, 
            location.longitude, 
            0, // altitude (not available in this context)
            0, // speed (not available in this context)
            0, // accuracy (not available in this context)
            0  // bearing (not available in this context)
          );
        }
      } else {
        messengerRef.current.sendLocatorAppExit(phoneNumber);
      }
    } else {
      console.error("Unable to toggle location monitoring: user or phone number not available");
      showToast("Unable to toggle location monitoring", "error", "Please ensure you're logged in and have a valid phone number.");
    }
  };

  const handleStartPreAlarm = () => {
    if (isPreAlarmActive) {
      // Stop pre-alarm
      setIsPreAlarmActive(false);
      setPreAlarmTimeRemaining(null);
      console.log("Pre-alarm stopped");
      if (messengerRef.current && user && user.phoneNumber) {
        messengerRef.current.sendLocatorPreAlarmCancel(user.phoneNumber);
      } else {
        console.error("Unable to cancel pre-alarm: user or phone number not available");
        showToast("Unable to cancel pre-alarm", "error", "Please ensure you're logged in and have a valid phone number.");
      }
    } else {
      setIsPreAlarmDialogOpen(true);
      console.log("Opening pre-alarm dialog");
    }
  };

  const handlePreAlarmEnd = () => {
    setIsPreAlarmActive(false);
    if (messengerRef.current && user && user.phoneNumber) {
      messengerRef.current.sendLocatorManDownPreAlarmExpired(user.phoneNumber);
    } else {
      console.error("Unable to send pre-alarm expiration: user or phone number not available");
      showToast("Unable to send pre-alarm expiration", "error", "Please ensure you're logged in and have a valid phone number.");
    }
  };

  const handleExtendPreAlarm = () => {
    // TODO: Implement extend pre-alarm logic
    showToast("Pre-Alarm Extended", "info", "The pre-alarm duration has been extended.");
    if (messengerRef.current && user && user.phoneNumber) {
      messengerRef.current.sendLocatorPreAlarmExtended(user.phoneNumber);
    } else {
      console.error("Unable to extend pre-alarm: user or phone number not available");
      showToast("Unable to extend pre-alarm", "error", "Please ensure you're logged in and have a valid phone number.");
    }
  };

  const handleSOSAlarm = () => {
    setIsSOSAlarmActive(true);
    showToast("SOS Alarm Activated", "error", "Emergency services have been notified.");
    if (messengerRef.current && user && user.phoneNumber && location) {
      messengerRef.current.sendLocatorAlarmSOS(user.phoneNumber, location.latitude, location.longitude);
    } else {
      console.error("Unable to send SOS alarm: user, phone number, or location not available");
      showToast("Unable to send SOS alarm", "error", "Please ensure you're logged in, have a valid phone number, and location is available.");
    }
  };

  const handleSendLocation = () => {
    if (messengerRef.current && user && user.phoneNumber && location) {
      messengerRef.current.sendLocatorSingleReport(user.phoneNumber, location.latitude, location.longitude, 0, 0, 0, 0);
      showToast("Location Sent", "success", "Your current location has been sent.");
    } else {
      console.error("Unable to send location: user, phone number, or location not available");
      showToast("Unable to Send Location", "error", "Please ensure you're logged in, have a valid phone number, and location is available.");
    }
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

  useEffect(() => {
    let timer;
    if (isPreAlarmActive && preAlarmTimeRemaining > 0) {
      timer = setInterval(() => {
        setPreAlarmTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (preAlarmTimeRemaining === 0) {
      setIsPreAlarmActive(false);
      showToast("Pre-Alarm Ended", "info", "The pre-alarm has ended.");
      handlePreAlarmEnd();
    }
    return () => clearInterval(timer);
  }, [isPreAlarmActive, preAlarmTimeRemaining]);

  useEffect(() => {
    // Set up geolocation watching
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        if (messengerRef.current && user && user.phoneNumber) {
          messengerRef.current.setLocation(position.coords.latitude, position.coords.longitude);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        showToast("Unable to get location", "error", "Please check your device settings.");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [user]);

  useEffect(() => {
    if (!user || !user.phoneNumber) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, router]);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return showLoader ? (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700 text-white">
      <Loader className="w-16 h-16 animate-spin mb-4" />
      <p className="text-xl">Checking user information...</p>
    </div>
  ) : (
    <div className="flex flex-col min-h-screen bg-gray-700 text-white p-4">
      <Toaster richColors />
      <GeminiMessenger ref={messengerRef} />
      {/* Rest of the component remains the same */}
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
            <DropdownMenuContent className="bg-gray-600">
              <DropdownMenuItem className="hover:bg-gray-500">Settings</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-500">Help</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-500">About</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray-500">Logout</DropdownMenuItem>
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
            className={`${isPreAlarmActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#757575] hover:bg-[#656565]'} h-32 flex flex-col items-center justify-center rounded-lg font-bold text-white transition-colors duration-200 shadow-lg`}
          >
            {renderButtonContent(
              <Bell className="w-16 h-16 mb-2" />,
              <span className="text-[0.98em]">{isPreAlarmActive ? 'Stop Pre-Alarm' : 'Start Pre-Alarm'}</span>
            )}
          </Button>

          <Button 
            onClick={handleSOSAlarm} 
            variant="destructive" 
            className="bg-red-500 hover:bg-red-600 h-32 flex flex-col items-center justify-center col-span-2 rounded-lg font-bold text-white transition-colors duration-200 shadow-lg"
          >
            {renderButtonContent(<AlertTriangle className="w-16 h-16 mb-2" />, <span className="text-[0.98em]">SOS Alarm</span>)}
          </Button>

          <Button
            onClick={handleSendLocation}
            variant="default"
            className="bg-[#757575] hover:bg-[#656565] h-32 flex flex-col items-center justify-center col-span-2 rounded-lg font-bold text-white transition-colors duration-200 shadow-lg"
          >
            {renderButtonContent(<Send className="w-16 h-16 mb-2" />, <span className="text-[0.98em]">Send Location</span>)}
          </Button>

          {isPreAlarmActive && preAlarmTimeRemaining !== null && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg text-center col-span-2">
              <h2 className="text-lg font-semibold mb-2">Pre-Alarm Monitoring</h2>
              <p className="text-3xl font-bold mb-4">
                {Math.floor(preAlarmTimeRemaining / 60)}:
                {(preAlarmTimeRemaining % 60).toString().padStart(2, '0')}
              </p>
              <Button 
                onClick={handleExtendPreAlarm} 
                variant="default" 
                className="bg-[#757575] hover:bg-[#656565] px-4 py-2 rounded-lg font-bold text-white transition-colors duration-200 shadow-lg"
              >
                Extend Pre-Alarm Monitoring
              </Button>
            </div>
          )}
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

      <PreAlarmDialog
        open={isPreAlarmDialogOpen}
        onOpenChange={setIsPreAlarmDialogOpen}
        onPreAlarmStart={handlePreAlarmStart}
        showToast={showToast}
      />

      <SOSAlarm
        isActive={isSOSAlarmActive}
        onDeactivate={() => setIsSOSAlarmActive(false)}
      />
    </div>
  );
}