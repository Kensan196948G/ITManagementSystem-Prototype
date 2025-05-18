import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// 修正ポイント: plugins配列をPluginOption型にキャストして型不一致を回避
export default defineConfig({
    plugins: [react()] as PluginOption[],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 3000,
    },
    build: {
        outDir: 'dist',
    },
});