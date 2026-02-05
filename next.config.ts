import type { NextConfig } from "next";

// Local-only config: do not proxy /api to a separate backend.
// If you later run a FastAPI server, you can reintroduce a rewrite here.
const nextConfig: NextConfig = {};

export default nextConfig;
