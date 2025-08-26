/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false,
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
