module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            'ul, ol': {
              marginTop: '0.75em',
              marginBottom: '0.75em',
              paddingLeft: '1.5em',
            },
            li: {
              marginTop: '0.25em',
              marginBottom: '0.25em',
              lineHeight: '1.6',
            },
            'li::marker': {
              color: '#2563eb',
            },
            a: {
              textDecoration: 'underline',
              textDecorationColor: '#1e40af',
              textDecorationThickness: '2px',
              textUnderlineOffset: '3px',
              color: '#1e40af',
              fontWeight: '500',
            },
            'a:hover': {
              color: '#1d4ed8',
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
