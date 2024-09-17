import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const AboutScreen = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-700 p-6 rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">About Gemini Locator</h2>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="h-6 w-6 text-white" />
          </Button>
        </div>
        <div className="text-white">
          <p className="mb-4">
            Gemini Locator is a cutting-edge location monitoring and safety application designed to provide peace of mind to users and their loved ones.
          </p>
          <p className="mb-4">
            Key features:
            <ul className="list-disc list-inside ml-4">
              <li>Real-time location monitoring</li>
              <li>Pre-alarm functionality for potentially dangerous situations</li>
              <li>SOS alarm for immediate emergency assistance</li>
              <li>Secure and private communication with emergency contacts</li>
            </ul>
          </p>
          <p>
            Version: 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;