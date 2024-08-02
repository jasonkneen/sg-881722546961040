import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'verify'
  const router = useRouter();

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement API call to send verification code
    setStep('verify');
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement API call to verify code
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-8">Gemini Locator</h1>
      {step === 'phone' ? (
        <form onSubmit={handlePhoneSubmit} className="w-full max-w-xs">
          <h2 className="text-xl mb-4">Sign in to your account</h2>
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
          <Button type="submit" className="w-full">Sign In</Button>
        </form>
      ) : (
        <form onSubmit={handleVerificationSubmit} className="w-full max-w-xs">
          <h2 className="text-xl mb-4">Enter Verification Code</h2>
          <div className="mb-4">
            <Label htmlFor="verificationCode">Verification Code</Label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="Enter the code sent to your phone"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full">Verify</Button>
        </form>
      )}
    </div>
  );
}