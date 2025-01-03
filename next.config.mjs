/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "raw.githubusercontent.com",
                pathname: "/443eb9/443eb9/refs/heads/main/avatar.webp",
            },
            {
                protocol: "https",
                hostname: "oss.443eb9.dev",
            },
            {
                protocol: "https",
                hostname: "media.steampowered.com",
            },
        ],
    },
};

export default nextConfig;
