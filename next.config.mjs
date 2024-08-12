/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'oss.443eb9.dev',
                port: '',
                pathname: '',
            }
        ]
    }
};

export default nextConfig;
