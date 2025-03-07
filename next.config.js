/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Desativar a renderização estática para evitar problemas de hidratação
  staticPageGenerationTimeout: 0,
  experimental: {
    // Desativar a otimização de renderização estática
    optimizeCss: false,
  },
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig; 