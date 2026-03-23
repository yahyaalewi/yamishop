/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f4d5c', // Bleu canard per Stitch info
          light: '#1a6f85',
          dark: '#08333e'
        },
        sage: {
          DEFAULT: '#8FBC8F', // Vert sauge
        },
        beige: {
          DEFAULT: '#F5F5DC',
          light: '#FAFAEE'
        },
        terracotta: {
          DEFAULT: '#E2725B',
          light: '#E88D7A'
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
