module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Scans all JS, JSX, TS, and TSX files in the src folder
    './public/index.html',        // Add this if your HTML files are also dynamically styled
  ],
  darkMode: 'class', // Enables dark mode support
  theme: {
    fontFamily: {
      display: ['Open Sans', 'sans-serif'], // Font for display
      body: ['Open Sans', 'sans-serif'],   // Font for body
    },
    extend: {
      fontSize: {
        14: '14px', // Adds a custom font size
      },
      backgroundColor: {
        'main-bg': '#FAFBFB',
        'main-dark-bg': '#20232A',
        'secondary-dark-bg': '#33373E',
        'light-gray': '#F7F7F7',
        'half-transparent': 'rgba(0, 0, 0, 0.5)',
      },
      borderWidth: {
        1: '1px', // Custom border width
      },
      borderColor: {
        color: 'rgba(0, 0, 0, 0.1)', // Custom border color
      },
      width: {
        400: '400px',
        760: '760px',
        780: '780px',
        800: '800px',
        1000: '1000px',
        1200: '1200px',
        1400: '1400px',
      },
      height: {
        80: '80px', // Custom height
      },
      minHeight: {
        590: '590px', // Custom minimum height
      },
      backgroundImage: {
        'hero-pattern':
          "url('https://i.ibb.co/MkvLDfb/Rectangle-4389.png')", // Custom background image
      },
    },
  },
  plugins: [], // Add any necessary Tailwind plugins here
};
