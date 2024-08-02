import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import PreAlarmDialog from '@/components/PreAlarmDialog';
import SOSAlarm from '@/components/SOSAlarm';
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState('Idle');
  const [isLocationMonitoring, setIsLocationMonitoring] = useState(false);
  const [isPreAlarmDialogOpen, setIsPreAlarmDialogOpen] = useState(false);
  const [isSOSAlarmActive, setIsSOSAlarmActive] = useState(false);
  const [location, setLocation] = useState(null);
  const { toast } = useToast();

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
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please check your settings.",
            variant: "destructive",
          });
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isLocationMonitoring]);

  const toggleLocationMonitoring = () => {
    setIsLocationMonitoring(!isLocationMonitoring);
    setStatus(isLocationMonitoring ? 'Idle' : 'Monitoring');
    toast({
      title: isLocationMonitoring ? "Monitoring Stopped" : "Monitoring Started",
      description: isLocationMonitoring ? "Location monitoring has been stopped." : "Your location is now being monitored.",
    });
  };

  const handleStartPreAlarm = () => {
    setIsPreAlarmDialogOpen(true);
  };

  const handleSOSAlarm = () => {
    setIsSOSAlarmActive(true);
    // TODO: Implement server-side SOS alert
    toast({
      title: "SOS Alarm Activated",
      description: "Emergency services have been notified.",
      variant: "destructive",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gemini Locator</h1>
        <div className="text-sm">
          Status: <span className="font-bold">{status}</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col gap-4">
        <Button
          onClick={toggleLocationMonitoring}
          variant={isLocationMonitoring ? "destructive" : "default"}
        >
          {isLocationMonitoring ? 'Stop Monitoring' : 'Start Location Monitoring'}
        </Button>

        <Button onClick={handleStartPreAlarm} variant="outline">
          Start Pre-Alarm Monitoring
        </Button>

        <Button onClick={handleSOSAlarm} variant="destructive">
          SOS Alarm
        </Button>

        {location && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Current Location</h2>
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
          </div>
        )}
      </main>

      <footer className="mt-8">
        <Button onClick={logout} variant="ghost">Logout</Button>
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