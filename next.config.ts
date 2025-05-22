const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Disable default image optimization
  },
  ...(isProd && {
    assetPrefix: '/pdf_viewer_with_region_highlight/',
    basePath: '/pdf_viewer_with_region_highlight',
    output: 'export'
  })
};

export default nextConfig;