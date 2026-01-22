import mdx from "@next/mdx";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["next-mdx-remote"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "**",
      },
    ],
  },
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
};

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false,
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/~offline",
  },
  cacheOnFrontEndNav: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // Home page - cache with StaleWhileRevalidate
      {
        urlPattern: /^https:\/\/[^\/]+\/$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "home-page",
          expiration: {
            maxEntries: 5,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      // Next.js static assets
      {
        urlPattern: /^https:\/\/.*\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
      // Next.js optimized images
      {
        urlPattern: /^https:\/\/.*\/_next\/image\?.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-image",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      // External images (manga covers, etc.) - handle CORS with cacheableResponse
      {
        urlPattern: /\.(png|jpg|jpeg|webp|gif|svg|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "external-images",
          expiration: {
            maxEntries: 1000,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200], // Cache opaque (0) and successful (200) responses
          },
        },
      },
      // Images from external CDNs (e.g., shngm API)
      {
        urlPattern: /^https:\/\/.*\/(uploads|images|covers|storage)\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "cdn-images",
          expiration: {
            maxEntries: 1000,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      // Library page
      {
        urlPattern: /^https:\/\/.*\/library$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "library-page",
          expiration: {
            maxEntries: 5,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      // Chapter pages
      {
        urlPattern: /^https:\/\/.*\/chapter\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "chapter-pages",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      // Manga detail pages
      {
        urlPattern: /^https:\/\/.*\/manga\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "manga-pages",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      // Search page
      {
        urlPattern: /^https:\/\/.*\/search.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "search-page",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      // External Manga API - cache for offline (api.shngm.io)
      {
        urlPattern: /^https:\/\/api\.shngm\.io\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "manga-api",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      // Internal API requests - cache for offline
      {
        urlPattern: /^https:\/\/.*\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
          networkTimeoutSeconds: 5,
        },
      },
      // All other requests
      {
        urlPattern: /^https:\/\/.*$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "others",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

export default withMDX(withPWA(nextConfig));
