import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 설정을 정의합니다.
// react 플러그인을 사용하여 React 컴포넌트의 빠른 핫 리로딩(HMR) 및 빌드를 지원합니다.
export default defineConfig({
  plugins: [
    // React 지원을 위한 공식 Vite 플러그인입니다.
    react()
  ],
  server: {
    // 개발 서버의 포트를 지정합니다.
    port: 3000,
    // 개발 서버 기동 시 자동으로 브라우저를 엽니다.
    open: true
  }
});
