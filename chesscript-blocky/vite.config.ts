import { defineConfig, Plugin } from 'vite'

const advancedCors: Plugin = {
   name: 'configure-response-headers',
   configureServer: server => {
      server.middlewares.use((_req, res, next) => {
         res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
         res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
         next();
      });
   }
}

export default defineConfig({
   base: '',
   plugins: [advancedCors],
   build: {
      target: 'es2018',
      cssCodeSplit: false,
      copyPublicDir: true,
      rollupOptions: {
         input: {
            app: 'mission-editor.html'
         },
         output: {
            entryFileNames: 'index.js',
            assetFileNames: 'index.css',
         }
      }
   }
})
