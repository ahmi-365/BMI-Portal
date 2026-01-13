import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Any request starting with /api/hf will be forwarded to Hugging Face
        '/api/hf': {
          target: 'https://api-inference.huggingface.co',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/hf/, ''),
          secure: true,
        },
      },
    },
  };
});