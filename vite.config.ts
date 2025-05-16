// vite.config.ts (プロジェクトルート)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import history from 'connect-history-api-fallback';

export default defineConfig({
  root: '.', // Viteのルートディレクトリをプロジェクトルートに明示的に設定
  publicDir: 'public', // 静的ファイルディレクトリをプロジェクトルートのpublicに明示的に設定
  plugins: [react()],
  server: {
    open: true,
    port: 5174, // ポート番号を5174に設定
    fs: {
      cachedChecks: false,
      strict: false,
    },
    // History API Fallbackの設定
    // @ts-ignore // 型エラーを一時的に無視
    configureServer: (app) => {
      app.use(history({
        index: '/index.html' // エントリポイントのHTMLファイルを指定
      }));
    },
  },
  build: {
