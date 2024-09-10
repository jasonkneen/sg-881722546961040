import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className="bg-gray-700 min-h-screen">
        <Component {...pageProps} />
        <Toaster />
      </div>
    </AuthProvider>
  );
}