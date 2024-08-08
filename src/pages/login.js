import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import SixDigitInput from '@/components/SixDigitInput';
import CountryCodeDropdown from '@/components/CountryCodeDropdown';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState('phone');
  const router = useRouter();
  const { login, sendVerificationCode, loading, error } = useAuth();

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phoneNumber.trim() && /^\d{10}$/.test(phoneNumber)) {
      await sendVerificationCode(countryCode + phoneNumber);
      setStep('verify');
    } else {
      alert("Please enter a valid 10-digit phone number.");
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-8">Gemini Locator</h1>
      {error && (
        <Alert variant="destructive" className="mb-4 w-full max-w-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="w-full max-w-xs bg-gray-800 p-6 rounded-lg shadow-md">
        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Enter your phone number</h2>
            <div>
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Code"
              )}
            </Button>
          </form>
        )}
        {step === 'verify' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Enter Verification Code</h2>
            <SixDigitInput onComplete={handleVerificationSubmit} />
            <Button onClick={handleResendCode} variant="outline" className="w-full mt-4" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Code"
              )}
            </Button>
            <Button onClick={() => setStep('phone')} variant="ghost" className="w-full mt-2">
              Back to Phone Number
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}