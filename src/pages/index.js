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
import AboutModal from '@/components/AboutModal';
import HelpModal from '@/components/HelpModal';
import SettingsModal from '@/components/SettingsModal'; // Import the SettingsModal
import Link from 'next/link';

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
  const [isPreAlarmExtension, setIsPreAlarmExtension] = useState(false); // Add this line
  const messengerRef = useRef(null);
  const [showLoader, setShowLoader] = useState(true);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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
      if (isPreAlarmExtension) { // This line will now work
        messengerRef.current.sendLocatorPreAlarmExtended(user.phoneNumber, `PreAlarm extended for ${duration} minutes. Details: ${details}`);
        showToast("Pre-Alarm Extended", "info", `Pre-alarm extended for ${duration} minutes. Details: ${details}`);
      } else {
        messengerRef.current.sendLocatorPreAlarm(user.phoneNumber, `PreAlarm started for ${duration} minutes. Details: ${details}`);
        showToast("Pre-Alarm Started", "info", `Pre-alarm activated for ${duration} minutes. Details: ${details}`);
      }
    } else {
      console.error("Unable to send pre-alarm message: user or phone number not available");
      showToast("Unable to send pre-alarm message", "error", "Please ensure you're logged in and have a valid phone number.");
    }
    setIsPreAlarmExtension(false);
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

  const toggleLocationMonitoring = async () => {
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
        // TODO move this outside messengerRef.current.sendLocatorAppStart(phoneNumber);
        // Send initial location if available
        if (location) {
          messengerRef.current.sendLocatorShiftBegin(phoneNumber);        
          
          // wait 10 seconds
          await new Promise(resolve => setTimeout(resolve, 1000));
          
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
        // TODO move this messengerRef.current.sendLocatorAppExit(phoneNumber);
        messengerRef.current.sendLocatorShiftFinished(phoneNumber);
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
        showToast("Pre-Alarm Stopped", "info", "The pre-alarm has been cancelled.");
      } else {
        console.error("Unable to cancel pre-alarm: user or phone number not available");
        showToast("Unable to cancel pre-alarm", "error", "Please ensure you're logged in and have a valid phone number.");
      }
    } else {
      setIsPreAlarmDialogOpen(true);
      setIsPreAlarmExtension(false);
      console.log("Opening pre-alarm dialog");
    }
  };

  const handlePreAlarmEnd = () => {
    setIsPreAlarmActive(false);
    if (messengerRef.current && user && user.phoneNumber) {
      messengerRef.current.sendLocatorManDownPreAlarmExpired(user.phoneNumber);
      showToast("Pre-Alarm Expired", "info", "The pre-alarm duration has ended.");
    } else {
      console.error("Unable to send pre-alarm expiration: user or phone number not available");
      showToast("Unable to send pre-alarm expiration", "error", "Please ensure you're logged in and have a valid phone number.");
    }
  };

  const handleExtendPreAlarm = () => {
    setIsPreAlarmDialogOpen(true);
    setIsPreAlarmExtension(true);
    console.log("Opening pre-alarm extension dialog");
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const authenticate = async () => {
    const OIDCUrl = 'https://auth.gemini-sense.com/realms/bold-api/protocol/openid-connect';
    const ClientId = 'locator-app'; // Replace with your actual client ID
   // const redirectUri = 'boldlocator://enroll'; // Replace with your actual redirect URI
  const redirectUri = 'boldlocator://enroll'; // Replace with your actual redirect URI
    // Step 1: Generate PKCE challenge (code verifier and code challenge)
    const generateCodeVerifier = () => {
      const array = new Uint32Array(56 / 2); // Length of code verifier
      window.crypto.getRandomValues(array);
      return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
    };
  
    const generateCodeChallenge = async (codeVerifier) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      const digest = await window.crypto.subtle.digest('SHA-256', data);
      return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')  // Replace + with -
        .replace(/\//g, '_')  // Replace / with _
        .replace(/=+$/, '');  // Remove trailing =
    };
  
    const generatePkceChallenge = async () => {
      const codeVerifier = generateCodeVerifier(); // Generate random code verifier
      const codeChallenge = await generateCodeChallenge(codeVerifier); // Generate code challenge (SHA256 hash)
  
      // Store the code verifier for later use in the token exchange
      sessionStorage.setItem('code_verifier', codeVerifier);
  
      return {
        verifier: codeVerifier,
        challenge: codeChallenge,
        method: 'S256' // The method used to generate the challenge (always S256 for SHA256)
      };
    };
  
    // Step 2: Generate PKCE challenge and redirect user to Keycloak login
    const pkceChallenge = await generatePkceChallenge();
  
    // Build the authentication URL
    const authUrl = `${OIDCUrl}/auth?response_type=code&client_id=${encodeURIComponent(ClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(pkceChallenge.verifier)}&code_challenge=${encodeURIComponent(pkceChallenge.challenge)}&code_challenge_method=${encodeURIComponent(pkceChallenge.method)}`;
  
    // Redirect the user to Keycloak for login
    window.location.href = authUrl;
  
    // Step 3: Handle callback and exchange authorization code for token (this happens after redirect)
    const exchangeCodeForToken = async (authCode) => {
      const codeVerifier = sessionStorage.getItem('code_verifier');
      const tokenUrl = `${OIDCUrl}/token`;
  alert('here')
      const body = new URLSearchParams({
        'grant_type': 'authorization_code',
        'code': authCode,
        'redirect_uri': redirectUri,
        'client_id': ClientId,
        'code_verifier': codeVerifier
      });
  
      try {
        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: body.toString()
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Token:', data);
        return data;
      } catch (error) {
        console.error('Error during token exchange:', error);
      }
    };
  
    // Step 4: After the user logs in and Keycloak redirects back, capture the authorization code and exchange it for a token
    const handleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get('code');
  
      if (authCode) {
        exchangeCodeForToken(authCode);
      } else {
        console.error('Authorization code not found in the URL.');
      }
    };
  
    // Call handleCallback when the user returns from the login flow
    handleCallback();
  };
  
  // Call authenticate function to initiate the login flow
  //  authenticate();

  // Call the authenticate function
  // authenticate(); // Uncomment this line if you want to call it immediately

  const handleAuthenticate = async () => {
    await authenticate();
  };

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true); // Open the settings modal
  };

  return showLoader ? (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700 text-white">
      <Loader className="w-16 h-16 animate-spin mb-4" />
      <p className="text-xl">Checking user information...</p>
    </div>
  ) : (
    <div className="flex flex-col min-h-screen bg-gray-700 text-white p-4">
      <Toaster richColors />
      <GeminiMessenger ref={messengerRef} />
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
              <DropdownMenuItem
                onClick={handleSettingsClick} // Open settings modal
                className="hover:bg-gray-500"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsHelpModalOpen(true)}
                className="hover:bg-gray-500"
              >
                Help
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsAboutModalOpen(true)}
                className="hover:bg-gray-500"
              >
                About
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="hover:bg-gray-500"
              >
                Logout
              </DropdownMenuItem>
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
      </main>

      <PreAlarmDialog
        open={isPreAlarmDialogOpen}
        onOpenChange={setIsPreAlarmDialogOpen}
        onPreAlarmStart={handlePreAlarmStart}
        showToast={showToast}
        isExtension={isPreAlarmExtension}
      />

      <SOSAlarm
        isActive={isSOSAlarmActive}
        onDeactivate={() => setIsSOSAlarmActive(false)}
        user={user}
        location={location}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <Button 
        onClick={handleAuthenticate} 
        variant="default" 
        className="bg-blue-500 hover:bg-blue-600 h-12 flex items-center justify-center rounded-lg font-bold text-white transition-colors duration-200 shadow-lg"
      >
        Authenticate
      </Button>

      {/* Render the SettingsModal here */}
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </div>
  );
}