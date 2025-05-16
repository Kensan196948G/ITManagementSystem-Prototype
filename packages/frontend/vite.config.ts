// vite.config.ts (プロジェクトルートに移動)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import history from 'connect-history-api-fallback';

export default defineConfig({
    // rootをfrontendディレクトリに指定
    root: 'frontend',
    // publicDirをfrontend/publicディレクトリに指定
    publicDir: 'frontend/public',
    plugins: [react()],
    server: {
        open: true,
        port: 5174,
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
        outDir: 'dist', // ビルド出力先をプロジェクトルートのdistディレクトリに設定
    },
});