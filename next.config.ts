import type { NextConfig } from "next";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBaseUrl.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
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
