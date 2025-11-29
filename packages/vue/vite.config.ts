import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  // Dev mode: serve the dev folder
  if (command === 'serve') {
    return {
      plugins: [vue()],
      root: './dev',
      resolve: {
        alias: {
          '@quickforms/core': resolve(__dirname, '../core/src')
        }
      }
    };
  }

  // Build mode: build the library
  return {
    plugins: [
      vue(),
      dts({
        insertTypesEntry: true,
        copyDtsFiles: true,
        skipDiagnostics: true,
        exclude: ['../core/**']
      })
    ],
    build: {
      cssCodeSplit: false,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'QuickformsVue',
        fileName: 'index',
        formats: ['es']
      },
      rollupOptions: {
        external: ['vue', 'vee-validate', '@quickforms/core'],
        output: {
          globals: {
            vue: 'Vue',
            'vee-validate': 'VeeValidate',
            '@quickforms/core': 'QuickformsCore'
          }
        }
      }
    }
  };
});
