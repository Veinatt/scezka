import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Silence the "multiple lockfiles" warning when this project lives inside a
  // monorepo-style workspace root that also has a package-lock.json.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
