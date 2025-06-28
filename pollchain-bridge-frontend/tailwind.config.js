/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        gamefont: ['PressStart2P-Regular', 'sans-serif'],
        onest: ['Onest', 'sans-serif'],
      }
    },
  },
  plugins: [],
}