module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        apple: [
          'SF Pro Display',
          'SF Pro Text',
          'San Francisco',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'apple-glass': 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(240,240,255,0.6) 100%)',
        'apple-gradient': 'linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
      },
      backdropBlur: {
        glass: '8px',
      },
    },
  },
  plugins: [],
};
