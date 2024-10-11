import "../styles/globals.css";
import { Toaster } from "../components/ui/toaster";
import { AuthProvider } from '../context/AuthContext';
import { appWithTranslation } from 'next-i18next';
import { useEffect } from 'react';

function App({ Component, pageProps }) {
  useEffect(() => {
    console.log('App component mounted');
    console.log('Initial pageProps:', pageProps);
    console.log('Current language:', pageProps.lng || 'Not set');
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

App.getInitialProps = async ({ ctx, Component }) => {
  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  // Determine the language
  const lng = ctx.req ? ctx.req.language : (typeof navigator !== 'undefined' ? navigator.language : 'en');
  console.log('Detected language:', lng);

  return { pageProps: { ...pageProps, lng: lng || 'en' } };
};

export default appWithTranslation(App);
