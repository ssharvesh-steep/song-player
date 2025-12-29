import withPWAInit from 'next-pwa';
import webpack from 'webpack';

const withPWA = withPWAInit({
    dest: 'public',
    disable: false,
    register: true,
    skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Only use 'export' for GitHub Pages (when not on Vercel)
    output: process.env.VERCEL ? undefined : 'export',
    images: {
        unoptimized: true,
    },
    webpack: (config, { isServer }) => {
        // Fix for jsmediatags trying to load React Native modules
        config.resolve.alias = {
            ...config.resolve.alias,
            'react-native-fs': false,
            'react-native': false,
        };

        // Ignore React Native file readers in jsmediatags
        config.plugins.push(
            new webpack.IgnorePlugin({
                resourceRegExp: /^react-native/,
            })
        );

        return config;
    },
};

export default withPWA(nextConfig);
