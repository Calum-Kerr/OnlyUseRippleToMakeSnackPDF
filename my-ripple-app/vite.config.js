import { defineConfig } from 'vite';
import { ripple } from 'vite-plugin-ripple';

export default defineConfig({
	plugins: [ripple()],
	server: {
		port: 5173,
	},
	build: {
		target: 'esnext',
	},
});
