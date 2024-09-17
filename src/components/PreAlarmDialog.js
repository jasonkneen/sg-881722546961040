import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const timeOptions = [
  { label: '5 MINS', value: 5 },
  { label: '15 MINS', value: 15 },
  { label: '30 MINS', value: 30 },
  { label: '1 HR', value: 60 },
  { label: '1.5 HRS', value: 90 },
  { label: '2 HRS', value: 120 },
];

export default function PreAlarmDialog({ open, onOpenChange, onPreAlarmStart, showToast, isExtension }) {
  const [selectedTime, setSelectedTime] = useState(null);
  const [customTime, setCustomTime] = useState('');
  const [details, setDetails] = useState('');

  const handleStartPreAlarm = () => {
    const duration = selectedTime || parseInt(customTime, 10);
    // Validate duration
    if (!duration || duration <= 0) {
      showToast("Please select a valid time.", "error", "Invalid duration selected.");
      return;
    }
    // Start or extend pre-alarm with duration and details
    onPreAlarmStart(duration, details);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-700 w-[calc(100%-30px)] mx-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>{isExtension ? "Extend Pre-Alarm" : "Select expected end time"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            {timeOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => setSelectedTime(option.value)}
                variant={selectedTime === option.value ? "default" : "secondary"}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="customTime">Custom time (minutes):</Label>
            <Input
              id="customTime"
              type="number"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="col-span-2 border-white/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="details">Additional Details:</Label>
            <Textarea
              id="details"
              placeholder="Enter any additional information here..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="h-24 border-white/30"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleStartPreAlarm} className="w-full">
            {isExtension ? "Extend Pre-Alarm" : "Start Pre-Alarm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}