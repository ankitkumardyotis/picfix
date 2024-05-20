/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export', // Feel free to modify/remove this option

  // Override the default webpack configuration
  // webpack: (config) => {
  //   // Ignore node-specific modules when bundling for the browser
  //   // See https://webpack.js.org/configuration/resolve/#resolvealias
  //   config.resolve.alias = {
  //     ...config.resolve.alias,
  //     "sharp$": false,
  //     "onnxruntime-node$": false,
  //   }
  //   return config;
  // },
  // async rewrites() {
  //   return [
  //     {
  //       source: `/api/:path*`,
  //       destination: `/api/:path*`,
  //     },
  //     {
  //       source: `/:path*`,
  //       destination: `${process.env.NEXTAUTH_URL}/:path*`,
  //     },
  //   ];
  // },
  images: {
    domains: ["upcdn.io", "replicate.delivery", "lh3.googleusercontent.com"],
  },
};

export default nextConfig;