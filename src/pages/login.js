import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SixDigitInput from '@/components/SixDigitInput';
import CountryCodeDropdown from '@/components/CountryCodeDropdown';
import { useAuth } from '@/context/AuthContext';
import { MoreHorizontal, Send, MapPin, Play, Pause, Bell, BellRing, AlertTriangle, Wifi, Menu } from "lucide-react";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'verify'
  const router = useRouter();
  const { login, sendVerificationCode, loading, error } = useAuth();

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      await sendVerificationCode('+44' + phoneNumber);
      setStep('verify');
    }
  };

  const handleVerificationSubmit = async (code) => {
    await login('+44' + phoneNumber, code);
    if (!error) {
      router.push('/');
    }
  };

  const handleResendCode = () => {
    sendVerificationCode('+44' + phoneNumber);
  };

  const handlePhoneNumberChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.startsWith('0')) {
      value = value.substring(1);
    }
    setPhoneNumber(value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-700 text-white">
      <div className="flex items-center mb-14">
        <Wifi className="w-14 h-14 text-white mr-4" />
        <h1 className="text-4xl font-bold">Gemini Locator</h1>
      </div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {step === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="w-full max-w-xs">
          <h2 className="text-xl mb-8">Enter your phone number</h2>
          <div className="mb-8">
            <Label htmlFor="phoneNumber" className="block mb-2">Phone Number</Label>
            <div className="flex mt-6">
              <div className="bg-gray-600 text-white px-3 py-0 rounded-l-md flex items-center">
                +44
              </div>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                className="flex-1 rounded-l-none bg-gray-800 text-white placeholder-gray-500 border-none focus:ring-0"
                required
              />
            </div>
          </div>
          <div className="flex justify-center">
            <Button type="submit" className="w-full max-w-xs shadow-lg bg-green-500 hover:bg-green-600" disabled={loading}>Confirm Mobile</Button>
          </div>
        </form>
      )}
      {step === 'verify' && (
        <div className="w-full max-w-xs">
          <h2 className="text-xl mb-4">Enter Verification Code</h2>
          <SixDigitInput 
            onComplete={handleVerificationSubmit} 
            inputClassName="bg-gray-800 text-white placeholder-gray-500 border-none focus:ring-0"
          />
          <Button onClick={handleResendCode} variant="outline" className="w-full mt-4 shadow-lg bg-green-500 hover:bg-green-600 text-white" disabled={loading}>
           Confirm Code
          </Button>
        </div>
      )}
    </div>
  );
}