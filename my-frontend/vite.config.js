import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';  // path 모듈 추가

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),  // '@'을 'src' 폴더로 설정
    },
  },
});
