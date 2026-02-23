// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   swcMinify: true,
//   images: {
//     domains: ['localhost'],
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//         port: '5000',
//         pathname: '/uploads/**',
//       },
//     ],
//   },
//   env: {
//     API_URL: process.env.API_URL || 'http://localhost:5000/api',
//   },
// }

// module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // Purana localhost aur naya cloudinary dono allow kar diye
    domains: ['localhost', 'res.cloudinary.com'], 
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      // 👇 YE NAYA SECTION ADD KIYA HAI
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // Cloudinary ki saari images allow ho jayengi
      },
    ],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api',
  },
}

module.exports = nextConfig