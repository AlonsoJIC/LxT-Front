/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  basePath: '',
  //assetPrefix: '.',
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig