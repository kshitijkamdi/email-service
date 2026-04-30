/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#172026',
        line: '#d7dde3',
        paper: '#f7f8fa',
        accent: '#2563eb',
        coral: '#f97316'
      }
    }
  },
  plugins: []
};
