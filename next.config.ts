import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig = {
  reactStrictMode: false,
  turbopack: {},
};

export default withSerwist(nextConfig);
