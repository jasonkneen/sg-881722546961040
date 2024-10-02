/** @type {import('next').NextConfig} */
const nextConfig = async () => {
  const i18nConfig = await import('./next-i18next.config.js');
  return {
    reactStrictMode: true,
    i18n: i18nConfig.default.i18n,
  };
};

export default nextConfig;
