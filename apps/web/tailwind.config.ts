import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Jira-inspired color palette
        jira: {
          // Blues (Jira Primary)
          blue: {
            50: '#DEEBFF',
            100: '#B3D4FF',
            200: '#4C9AFF',
            300: '#2684FF',
            400: '#0065FF',
            500: '#0052CC', // Primary Jira blue
            600: '#0747A6',
            700: '#09326C',
            800: '#091E42',
          },
          // Grays (Backgrounds & Text)
          gray: {
            50: '#FAFBFC',
            100: '#F4F5F7',
            200: '#EBECF0',
            300: '#DFE1E6',
            400: '#B3BAC5',
            500: '#A5ADBA',
            600: '#7A869A',
            700: '#6B778C',
            800: '#505F79',
            900: '#344563',
            950: '#253858',
          },
          // Dark mode backgrounds
          dark: {
            bg: '#1D2125', // Main background
            surface: '#22272B', // Cards/panels
            border: '#363B3F', // Borders
            sidebar: '#0D1117', // Sidebar background
            navbar: '#0D1117', // Navbar background
          },
          // Status colors
          success: '#00875A',
          warning: '#FFAB00',
          danger: '#DE350B',
          info: '#0065FF',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
