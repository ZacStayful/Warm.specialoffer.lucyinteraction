import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          stayful: '#5d8156',
          glow: '#7aab72',
          dim: '#3d5939',
        },
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'monospace'],
        mono: ['var(--font-share-tech)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
