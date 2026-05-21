/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/images/optimized/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    deviceSizes: [640, 1080, 1600],
    formats: ["image/webp"],
    imageSizes: [72, 144, 232, 464],
    minimumCacheTTL: 31536000,
    qualities: [75],
  },
};

export default nextConfig;
