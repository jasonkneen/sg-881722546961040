import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const HelpModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Help</DialogTitle>
          <DialogDescription>
            Learn how to use Gemini Locator effectively.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h3 className="text-lg font-semibold mb-2">Quick Guide:</h3>
          <ul className="list-disc list-inside">
            <li>Location Monitoring: Start/stop tracking your location.</li>
            <li>Pre-Alarm: Set a timer for check-ins during activities.</li>
            <li>SOS Alarm: Quickly alert emergency contacts.</li>
          </ul>
          <p className="mt-4">For more detailed instructions, please visit our website or contact support.</p>
        </div>
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;