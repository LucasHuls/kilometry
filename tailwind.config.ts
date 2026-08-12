import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#111827',
          cyan: '#22D3EE',
          offwhite: '#F9FAFB',
        },
      },
    },
  },
  plugins: [],
}

export default config
