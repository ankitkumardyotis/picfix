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
    unoptimized: true,
    domains: [
      "upcdn.io",
      "replicate.delivery",
      "lh3.googleusercontent.com",
      "via.placeholder.com",
      "text-to-video-generation-service.b0287d60c39debfb14d7e3f036436719.r2.cloudflarestorage.com",
      "picfix.ai",
      "picfixcdn.com",
    ],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upcdn.io",
        port: "",
        pathname: "/**",
      },
    ],
  },

  api: {
    bodyParser: {
      sizeLimit: "16mb", // Adjust this value as needed
    },
  },
};

export default nextConfig;
