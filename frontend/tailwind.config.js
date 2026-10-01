/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // User design system exact color palette
        primary: {
          DEFAULT: '#B42332',
          hover: '#8F1D2A',
          50: '#FDF2F3',
          100: '#FBE4E6',
          200: '#F6CBD0',
          300: '#EE9EA6',
          400: '#E26B76',
          500: '#D04444',
          600: '#B42332', // Deep red
          700: '#8F1D2A', // Dark red hover
          800: '#6C1620',
          900: '#4D1017',
        },
        secondary: {
          DEFAULT: '#167D8D', // Teal
          hover: '#116370',
          50: '#F0F9FA',
          100: '#DCF1F4',
          200: '#BCE4EA',
          300: '#8DCFDB',
          400: '#4BAFC1',
          500: '#2A95A8',
          600: '#167D8D', // Teal
          700: '#116370',
          800: '#0F515C',
          900: '#0C4049',
        },
        page: '#F7F8FA', // Soft warm white
        surface: '#FFFFFF', // White
        main: '#202B36', // Charcoal
        muted: '#667085', // Slate gray
        pale: '#E4E7EC', // Pale gray
        success: {
          DEFAULT: '#25855A', // Green
          50: '#F0FDF4',
          100: '#DCFCE7',
          600: '#25855A',
          700: '#1F6B48',
        },
        warning: {
          DEFAULT: '#B7791F', // Amber
          50: '#FEFCE8',
          100: '#FEF9C3',
          600: '#B7791F',
          700: '#926018',
        },
        error: {
          DEFAULT: '#D04444', // Red
          50: '#FEF2F2',
          100: '#FEE2E2',
          600: '#D04444',
          700: '#B42332',
        },
      },
    },
  },
  plugins: [],
}
