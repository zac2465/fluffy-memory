/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},  // ✅ new package name
    autoprefixer: {},
  },
};

export default config;
