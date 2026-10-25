import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // The Docker image (Dockerfile, used by deploy/aws) sets NEXT_OUTPUT=standalone and runs
  // .next/standalone/server.js. Local `npm run dev` / `npm start` are unchanged.
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  cacheComponents: true,
  // Un-Said's web build (scripts/build-unsaid.sh -> public/unsaid) is a single-page app: any
  // /unsaid/<route> that isn't a file serves its index.html, and its router takes it from there.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        { source: "/unsaid", destination: "/unsaid/index.html" },
        { source: "/unsaid/:path*", destination: "/unsaid/index.html" },
      ],
    };
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
