/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        bg: {
          main: '#0B0F19',       /* Azul Noche Profundo */
          surface: '#1E293B',    /* Gris Pizarra Azulado */
          hover: '#334155',      /* Hover en tarjetas */
        },
        brand: {
          primary: '#FF6B00',    /* Naranja Cempasúchil */
          hover: '#E05D00',      /* Naranja oscuro para hover */
        },
        text: {
          main: '#F8FAFC',       /* Blanco Cálido / Marfil */
          muted: '#94A3B8',      /* Gris para textos secundarios */
        },
        border: {
          subtle: '#1E293B',     /* Bordes sutiles */
        }
      }
    },
  },
  plugins: [],
}

