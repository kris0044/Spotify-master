import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	 build: {
    outDir: 'build',  // Add this line
	    chunkSizeWarningLimit: 1000, // increases limit to 1000kb

  },
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 5173,
	},
});
