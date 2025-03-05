import ugrcPreset from '@ugrc/tailwind-preset';
import rac from 'tailwindcss-react-aria-components';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './node_modules/@ugrc/**/*.{tsx,jsx,js,ts}',
    './index.html',
    './tests/embed-test.html',
    './src/**/*.{tsx,jsx,js}',
  ],
  presets: [ugrcPreset],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E0F6FF',
          100: '#BDEBFF',
          200: '#7AD7FF',
          300: '#3DC5FF',
          400: '#00AFFA',
          500: '#0080B7',
          600: '#006894',
          700: '#004F70',
          800: '#003247',
          900: '#001924',
          950: '#000E14',
        },
        secondary: {
          50: '#E2F8FE',
          100: '#C9F2FD',
          200: '#93E6FB',
          300: '#5DD9F8',
          400: '#27CDF6',
          500: '#09B0DA',
          600: '#078FB0',
          700: '#056B84',
          800: '#044758',
          900: '#02242C',
          950: '#011014',
        },
        accent: {
          50: '#F7FBEF',
          100: '#EEF6DF',
          200: '#DEEDBF',
          300: '#CDE49F',
          400: '#BDDB7F',
          500: '#ADD361',
          600: '#91BF35',
          700: '#6D9028',
          800: '#49601B',
          900: '#24300D',
          950: '#121807',
        },
      },
    },
  },
  plugins: [rac],
};
