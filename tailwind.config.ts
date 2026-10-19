import type { Config } from 'tailwindcss';

/**
 * KORAMP Docs — palet gelap (AC-7).
 * bg #08080A, surface #141416/#1A1A1E/#232326, accent gold #D4B78F,
 * success green #22C55E, text #F5F5F5/#CFCFD4/#8B8B93.
 */
const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.mdx',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: '#08080A',
        surface: {
          1: '#141416',
          2: '#1A1A1E',
          3: '#232326',
        },
        line: {
          subtle: '#232326',
          DEFAULT: '#2A2A2E',
          strong: '#333338',
        },
        gold: {
          DEFAULT: '#D4B78F',
          hover: '#E2C9A5',
        },
        green: '#22C55E',
        ink: {
          primary: '#F5F5F5',
          secondary: '#CFCFD4',
          muted: '#8B8B93',
          disabled: '#5A5A60',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SF Mono', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
