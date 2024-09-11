import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className="bg-gray-800 min-h-screen"> {/* Changed from bg-gray-700 to bg-gray-800 */}
        <Component {...pageProps} />
        <Toaster />
      </div>
    </AuthProvider>
  );
}