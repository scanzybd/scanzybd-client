import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


import { cloudflare } from "@cloudflare/vite-plugin";


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  // Needed so `cloudflared tunnel --url http://localhost:5173` (and LAN) can reach the dev server
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'willow-motorcycle-anytime-huntington.trycloudflare.com'
    ]
  },
})