import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    'process.env': {}
  },
  server: {
    host: "::",
    port: 8080,
    historyApiFallback: true, // Add this to support client-side routing
  },
  plugins: [
    react()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "axios": path.resolve(__dirname, "./node_modules/axios")
    },
  },
  // Add this to ensure proper handling of client-side routing
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
}));
