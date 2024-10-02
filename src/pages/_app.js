import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { appWithTranslation } from 'next-i18next';
import { useEffect } from 'react';

function App({ Component, pageProps }) {
  useEffect(() => {
    console.log('App component mounted');
    console.log('Initial pageProps:', pageProps);
  }, []);

  useEffect(() => {
    console.log('pageProps updated:', pageProps);
  }, [pageProps]);

  return (
    <AuthProvider>
      <div className="bg-gray-800 min-h-screen">
        <Component {...pageProps} />
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default appWithTranslation(App);