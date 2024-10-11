/** @type {import('next').NextConfig} */
const nextConfig = async () => {
  const i18nConfig = await import('./next-i18next.config.js');
  return {
    reactStrictMode: true,
    i18n: {
      ...i18nConfig.default.i18n,
      localeDetection: false,
    },
    // Force static generation of all pages
    trailingSlash: true,
    // Ensure static generation includes all locales
    experimental: {
      staticPageGenerationTimeout: 1000,
    },
  };
};

export default nextConfig;
