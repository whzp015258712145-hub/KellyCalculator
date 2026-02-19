import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 如果是在 GitHub Actions 环境下（CI=true），使用仓库名作为基础路径
  // 否则（如 Vercel 或本地开发）使用根路径 '/'
  base: process.env.GITHUB_ACTIONS ? '/-/' : '/',
})
