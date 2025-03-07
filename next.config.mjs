/** @type {import('next').NextConfig}  
const nextConfig = {};

export default nextConfig;

/** @type {import('next').NextConfig} */
//const nextConfig = {
//    async rewrites() {
//      return [
//        {
//          source: '/api/:path*',
//          destination: 'https://sua-api-externa.com/:path*', // Substitua pela URL da sua API
//        },
//      ];
//    },
//    async headers() {
//      return [
//        {
//          // matching all API routes
//          source: '/api/:path*',
//          headers: [
//            { key: 'Access-Control-Allow-Origin', value: '*' }, // Permite todas as origens
//            { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS, POST, PUT, DELETE' },
//            { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization' },
//          ],
//        },
//      ];
//    },
//  };
//  
//  export default nextConfig;
//  
//   