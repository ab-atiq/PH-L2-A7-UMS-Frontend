import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      { source: "/apply", destination: "/faculty-access", permanent: true },
      {
        source: "/apply/:path*",
        destination: "/faculty-access/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
