import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Supabase'den gelen tüm resimlere izin ver
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Eğer Turbopack kullanıyorsan kasmayı önlemek için bazı ayarlar eklenebilir
};

export default nextConfig;