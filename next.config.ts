import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.co',
            },
        ],
    },
};

export default nextConfig;
// force rebuild 1789158207
