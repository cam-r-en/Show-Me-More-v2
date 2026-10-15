import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const configuredBase = process.env.VITE_BASE_PATH || "/";
const base = configuredBase.endsWith("/")
  ? configuredBase
  : `${configuredBase}/`;

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
