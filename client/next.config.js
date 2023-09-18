/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_ZEGO_APP_ID: 880899083,
    NEXT_PUBLIC_ZEGO_SERVER_ID: "ed4190d50b3177e6f0f8108681fe653f",
  },
  images: {
    domains: ['localhost'], //add domain of your server here
  }
};

module.exports = nextConfig;
