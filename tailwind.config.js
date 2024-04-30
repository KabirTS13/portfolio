/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      width: {
        '2.5/5': "45%",
        '1.5/5': "35%",
      },
      height: {
        '128': '32rem', 
      },
      maxHeight: {
        'projects': '30rem',
      },
      maxWidth: {
        'projects': '35rem',
      },
    },
  },
  plugins: [],
}