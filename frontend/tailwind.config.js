/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts,scss,css}",
  ],
  theme: {
    extend: {
      colors: {
        /* Backgrounds */
        bg: 'var(--color-bg)',
        card: 'var(--color-bg-card)',
        surface: 'var(--color-bg-surface)',
        glass: 'var(--color-bg-glass)',
        /* Borders */
        border: 'var(--color-border)',
        'border-hover': 'var(--color-border-hover)',
        /* Brand / Accent */
        primary: 'var(--color-accent)',
        'primary-hover': 'var(--color-accent-hover)',
        'primary-dim': 'var(--color-accent-dim)',
        'on-accent': 'var(--color-on-accent)',
        /* Text */
        text: 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',
        /* Semantic */
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        glow: 'var(--shadow-glow)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.3s ease forwards',
      },
    },
  },
  plugins: [],
}
