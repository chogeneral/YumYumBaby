import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SPA 모드로 설정하여 /reviews/write 같은 직접 URL 접근 시 index.html로 fallback합니다.
export default defineConfig({
  plugins: [react()],
  appType: "spa",
  optimizeDeps: {
    // react-quill-new 내부의 CommonJS 모듈을 Vite가 사전 번들링하도록 명시합니다.
    include: ["react-quill-new"]
  },
  server: {
    port: 3000,
    open: true
  }
});
