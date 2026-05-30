import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// قاعدة المسار لـ GitHub Pages على مستودع المشروع:
// https://ahmedalmnsour.github.io/khitab/  → base = '/khitab/'
export default defineConfig({
  base: '/khitab/',
  plugins: [react()],
});