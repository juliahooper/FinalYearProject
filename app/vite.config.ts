import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Static files come from static/, not public/. app/public/status.json is repo data that the
  // app reads through the GitHub API; serving it from public/ would publish it before sign-in.
  publicDir: 'static',
})
