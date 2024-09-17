import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const AboutModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>About Gemini Locator</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Gemini Locator is a personal safety application designed to provide peace of mind through location monitoring and emergency alerting features.</p>
          <p className="mt-2">Version: 1.0.0</p>
          <p className="mt-2">© 2023 Gemini Systems. All rights reserved.</p>
        </div>
        <Button onClick={onClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
};

export default AboutModal;