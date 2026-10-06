import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      { source: "/doctor", destination: "/faculty", permanent: true },
      {
        source: "/doctor/:path*",
        destination: "/faculty/:path*",
        permanent: true,
      },
      {
        source: "/admin/approve-doctor",
        destination: "/admin/faculty-approvals",
        permanent: true,
      },
      {
        source: "/dashboard/my-appointments",
        destination: "/dashboard/enrollments",
        permanent: true,
      },
      { source: "/apply", destination: "/faculty-access", permanent: true },
      {
        source: "/apply/:path*",
        destination: "/faculty-access/:path*",
        permanent: true,
      },
      {
        source: "/doctors",
        destination: "/faculty-directory",
        permanent: true,
      },
      {
        source: "/doctors/:path*",
        destination: "/faculty-directory/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
