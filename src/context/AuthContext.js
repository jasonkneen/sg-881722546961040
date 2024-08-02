import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // TODO: Check if user is already authenticated
  }, []);

  const login = async (phoneNumber) => {
    // TODO: Implement login logic
  };

  const logout = () => {
    // TODO: Implement logout logic
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);