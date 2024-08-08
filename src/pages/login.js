import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SixDigitInput from '@/components/SixDigitInput';
import CountryCodeDropdown from '@/components/CountryCodeDropdown';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'verify'
  const router = useRouter();
  const { login, sendVerificationCode, loading, error } = useAuth();

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      await sendVerificationCode(countryCode + phoneNumber);
      setStep('verify');
    }
  };

  const handleVerificationSubmit = async (code) => {
    await login(countryCode + phoneNumber, code);
    if (!error) {
      router.push('/');
    }
  };

  const handleResendCode = () => {
    sendVerificationCode(countryCode + phoneNumber);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-8">Gemini Locator</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {step === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="w-full max-w-xs">
          <h2 className="text-xl mb-4">Enter your phone number</h2>
          <div className="mb-4">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="flex mt-1">
              <CountryCodeDropdown
                value={countryCode}
                onChange={setCountryCode}
              />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 ml-2"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>Send Code</Button>
        </form>
      )}
      {step === 'verify' && (
        <div className="w-full max-w-xs">
          <h2 className="text-xl mb-4">Enter Verification Code</h2>
          <SixDigitInput onComplete={handleVerificationSubmit} />
          <Button onClick={handleResendCode} variant="outline" className="w-full mt-4" disabled={loading}>
            Send Again
          </Button>
        </div>
      )}
    </div>
  );
}