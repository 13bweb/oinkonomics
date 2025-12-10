/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'pangolin': ['Pangolin', 'cursive'],
        'inter': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'grotesk': ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#fdf8e7',
          100: '#fbeac2',
          200: '#f6d68a',
          300: '#f0c05b',
          400: '#e8a934',
          500: '#d18d1b',
          600: '#b17116',
          700: '#8b5514',
          800: '#6e4214',
          900: '#583611',
        },
      },
    },
  },
  plugins: [],
}
