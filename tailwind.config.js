/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#2563EB',
          soft: '#60A5FA',
        },
        brand: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          text: '#111827',
          textSecondary: '#6B7280',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
        }
      },
      borderRadius: {
        'card': '20px',
        'btn': '16px',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)',
        'premium': '0 20px 40px -15px rgba(37, 99, 235, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.02)',
        'glow-primary': '0 0 20px 2px rgba(37, 99, 235, 0.15)',
        'glow-success': '0 0 20px 2px rgba(34, 197, 94, 0.15)',
        'glow-warning': '0 0 20px 2px rgba(245, 158, 11, 0.15)',
        'glow-danger': '0 0 20px 2px rgba(239, 68, 68, 0.15)',
      }
    },
  },
  plugins: [],
}
