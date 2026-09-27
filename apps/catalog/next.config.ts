import type { NextConfig } from 'next';
const config: NextConfig = { output: 'export', trailingSlash: true, transpilePackages: ['@fewcompany/ui', '@fewcompany/core'] };
export default config;
