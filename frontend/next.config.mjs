import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "")

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig
