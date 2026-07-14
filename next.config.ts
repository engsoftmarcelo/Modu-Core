import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const headers = [
      {
        key: "Content-Security-Policy",
        value:
          "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
      },
      { key: "Permissions-Policy", value: "camera=(self), geolocation=(), microphone=(), browsing-topics=()" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
    ];

    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000",
      });
    }

    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
