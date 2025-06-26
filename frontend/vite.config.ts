import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    css: {
        postcss: './postcss.config.ts',
    },
    server: {
        host: '0.0.0.0',
        port: 5173, // or any available port
    }
});