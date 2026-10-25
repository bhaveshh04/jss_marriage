/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "4mb" }, serverComponentsExternalPackages: ["exceljs"] },
};
export default nextConfig;
