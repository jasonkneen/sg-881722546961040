import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // TODO: Check if user is already authenticated
  }, []);

  const login = async (phoneNumber, verificationCode) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement login logic with API call
      // For now, we'll simulate a successful login
      setUser({ phoneNumber });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  const sendVerificationCode = async (phoneNumber) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement API call to send verification code
      // For now, we'll simulate a successful code send
      console.log(`Verification code sent to ${phoneNumber}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, sendVerificationCode, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);