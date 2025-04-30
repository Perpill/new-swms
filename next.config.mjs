/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Find and modify the CSS rule
    const cssRule = config.module.rules.find(
      (rule) => rule.test && rule.test.toString().includes(".css")
    );

    if (cssRule) {
      // Exclude leaflet.css from PostCSS processing
      cssRule.exclude = /leaflet\.css$/;

      // Add a separate rule for leaflet.css
      config.module.rules.push({
        test: /leaflet\.css$/,
        use: ["css-loader"],
      });
    }

    return config;
  },
};

export default nextConfig;
