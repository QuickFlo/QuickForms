import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar } from '@quasar/vite-plugin';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  // Dev mode: serve the dev folder
  if (command === 'serve') {
    return {
      plugins: [
        vue(),
        quasar({
          sassVariables: false
        })
      ],
      root: './dev',
      resolve: {
        alias: {
          '@quickflo/quickforms': resolve(__dirname, '../core/src'),
          '@quickflo/quickforms-vue': resolve(__dirname, '../vue/src')
        }
      }
    };
  }

  // Build mode: build the library
  return {
    plugins: [
      vue(),
      quasar({
        sassVariables: false
      }),
      dts({
        insertTypesEntry: true,
        copyDtsFiles: true,
        skipDiagnostics: true,
        exclude: ['../core/**', '../vue/**']
      })
    ],
    build: {
      cssCodeSplit: false,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'QuickformsQuasar',
        fileName: 'index',
        formats: ['es']
      },
      rollupOptions: {
        external: ['vue', 'quasar', 'vee-validate', '@quickflo/quickforms', '@quickflo/quickforms-vue'],
        output: {
          globals: {
            vue: 'Vue',
            quasar: 'Quasar',
            'vee-validate': 'VeeValidate',
            '@quickflo/quickforms': 'QuickformsCore',
            '@quickflo/quickforms-vue': 'QuickformsVue'
          }
        }
      }
    }
  };
});
