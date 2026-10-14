const nextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "jbxuoxoetzvgxhyojqkc.supabase.co",
        pathname: "/storage/v1/object/public/recipe-images/**",
      },
    ],
  },
};

export default nextConfig;