import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function SOSAlarm({ isActive, onDeactivate }) {
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleDeactivate = () => {
    setIsDeactivating(true);
    // TODO: Implement server-side SOS deactivation
    setTimeout(() => {
      onDeactivate();
      setIsDeactivating(false);
    }, 2000); // Simulating server response time
  };

  return (
    <Dialog open={isActive} onOpenChange={onDeactivate}>
      <DialogContent className="sm:max-w-[425px] bg-red-600 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">SOS ALARM ACTIVE</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-6">
          <AlertTriangle size={64} className="mb-4" />
          <p className="text-lg text-center mb-2">Emergency services have been notified</p>
          <p className="text-xl font-bold">Help is on the way</p>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleDeactivate} 
            className="w-full bg-white text-red-600 hover:bg-gray-200"
            disabled={isDeactivating}
          >
            {isDeactivating ? "Deactivating..." : "Stop SOS Alarm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}