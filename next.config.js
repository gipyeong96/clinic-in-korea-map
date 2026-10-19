/** @type {import('next').Config} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{source:'/clinic-sitemap-:page.xml',destination:'/clinic-sitemaps/:page.xml'}];
  },
  async redirects() {
    return ['en', 'mn'].map((locale) => ({
      source: `/${locale}/:path*`,
      destination: '/:path*',
      permanent: true,
    }));
  },
  images: {
    domains: ['www.gold-man.com', 'clinicmap.kr'],
  },
}

module.exports = nextConfig
