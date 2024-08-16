import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import PreAlarmDialog from "@/components/PreAlarmDialog";
import SOSAlarm from "@/components/SOSAlarm";
import { toast, Toaster } from "sonner";
import {
  MoreHorizontal,
  Send,
  Battery,
  MapPin,
  Play,
  Pause,
  Bell,
  BellRing,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import APIWrapper from "@/lib/api-wrapper";

const api = new APIWrapper("https://api.example.com", true); // Use mock data

function AIChatHistory() {
  const [logs, setLogs] = useState<string[]>(["Initial log"]);
  const logRef = useRef<HTMLDivElement>(null);
  const [isLocationMonitoring, setIsLocationMonitoring] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);

  useEffect(() => {
    const handleLog = (event: CustomEvent<string>) => {
      setLogs((prevLogs) => [...prevLogs, event.detail]);
    };

    window.addEventListener("api-log" as any, handleLog as EventListener);

    // Initial API calls
    const initializeData = async () => {
      try {
        const phoneNumber = "+1234567890"; // Sample phone number
        await api.getMobileUser(phoneNumber);
        await api.getAlarmTransmissionConfiguration();
      } catch (error) {
        console.error("Error initializing data:", error);
      }
    };

    initializeData();

    // Add a test log
    api.logMessage("Component mounted");

    return () => {
      window.removeEventListener("api-log" as any, handleLog as EventListener);
    };
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className='flex flex-col h-screen'>
      <div className='flex-grow overflow-y-auto p-4'>
        <h1>AI Chat History</h1>
        {/* ... existing chat history ... */}
      </div>
      {/* Console-style logging view */}
      <div
        ref={logRef}
        className='h-64 overflow-y-auto bg-black text-green-400 p-2 font-mono text-sm'
      >
        <h2 className='text-white mb-2'>Console Logs:</h2>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      <Toaster />
    </div>
  );
}

export default AIChatHistory;
