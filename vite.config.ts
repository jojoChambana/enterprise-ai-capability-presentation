import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use the repo-scoped base path only for production builds (GitHub Pages).
// In local dev the base stays as '/' so http://localhost:5173 works directly.
// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base:
    command === 'build'
      ? '/enterprise-ai-capability-presentation/'
      : '/',
}));
