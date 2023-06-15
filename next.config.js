/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  generateTimeout: 120000, // Increase the timeout to 120 seconds
  images: {
    domains: ["upcdn.io", "replicate.delivery", "lh3.googleusercontent.com"],
  }
}

module.exports = nextConfig
