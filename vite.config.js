import { defineConfig } from "vite";

export default defineConfig({
  json:{
    stringify: true,
  },
  build: {
    modulePreload: {
      polyfill: false, // モジュールプリロードのポリフィルを無効化
    },

    minify: false, // 文字列ではなくブール値を使用すべき
  },
});
