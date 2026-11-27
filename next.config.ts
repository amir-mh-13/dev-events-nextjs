import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,

	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
			}
		]
	},

	allowedDevOrigins: ["10.13.78.145"],
};

export default nextConfig;
