import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SixDigitInput from '@/components/SixDigitInput';

export default function Login() {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState('username'); // 'username', 'phone', or 'verify'
  const router = useRouter();

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (username.trim()) {
      setStep('phone');
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      // TODO: Implement API call to send verification code
      setStep('verify');
    }
  };

  const handleVerificationSubmit = async (code) => {
    // TODO: Implement API call to verify code
    console.log('Verification code:', code);
    router.push('/');
  };

  const handleResendCode = () => {
    // TODO: Implement API call to resend verification code
    console.log('Resending verification code');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-8">Gemini Locator</h1>
      {step === 'username' && (
        <form onSubmit={handleUsernameSubmit} className="w-full max-w-xs">
          <h2 className="text-xl mb-4">Enter your username</h2>
          <div className="mb-4">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full">Next</Button>
        </form>
      )}
      {step === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="w-full max-w-xs">
          <h2 className="text-xl mb-4">Enter your phone number</h2>
          <div className="mb-4">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full">Send Code</Button>
        </form>
      )}
      {step === 'verify' && (
        <div className="w-full max-w-xs">
          <h2 className="text-xl mb-4">Enter Verification Code</h2>
          <SixDigitInput onComplete={handleVerificationSubmit} />
          <Button onClick={handleResendCode} variant="outline" className="w-full mt-4">
            Send Again
          </Button>
        </div>
      )}
    </div>
  );
}