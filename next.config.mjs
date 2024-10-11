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
    // Force generation of pages for all locales
    exportPathMap: async function (defaultPathMap, { dev, dir, outDir, locales, defaultLocale }) {
      const paths = {};
      for (const [path, config] of Object.entries(defaultPathMap)) {
        for (const locale of locales) {
          paths[`/${locale}${path}`] = { ...config, locale };
        }
      }
      return paths;
    },
  };
};

export default nextConfig;
