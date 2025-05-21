const isProd = process.env.NODE_ENV === 'production';
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Disable default image optimization
  },
  assetPrefix: isProd ? '/pdf_viewer_with_region_highlight/' : '',
  basePath: isProd ? '/pdf_viewer_with_region_highlight' : '',
  output: 'export'
};

export default nextConfig;