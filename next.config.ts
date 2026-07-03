import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    turbopack: {},

    /*== HTML 页面禁长缓存 — 发版后立即生效；静态资源(_next/)由文件名哈希自破缓存,保持长缓存 ==*/
    async headers() {
        return [
            {
                source: '/:path((?!_next).*)*',
                headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
            },
        ];
    },
};

export default nextConfig;
