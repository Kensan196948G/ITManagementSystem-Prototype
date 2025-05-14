/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',                      // ← Vite のエントリポイント（Figma出力含む想定）
    './src/**/*.{js,ts,jsx,tsx}',               // ← Reactソース
    './src/components/**/*.{js,ts,jsx,tsx}',    // ← コンポーネント（Figma自動出力がここに入ることが多い）
    './src/styles/**/*.{css,scss}',             // ← 独自スタイル
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        accent: '#17a2b8',
        danger: '#dc3545',
        success: '#28a745',
        warning: '#ffc107',
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        soft: '0 4px 8px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
