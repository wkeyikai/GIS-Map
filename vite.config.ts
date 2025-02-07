import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path' // ts 報錯時記得安裝 @types/node -D
import { viteMockServe } from 'vite-plugin-mock'
// import { createSvgIconsPlugin } from 'vite-plugin-svg-icons' // svg
import checker from 'vite-plugin-checker' // dev 的時候檢查型別，如果不想要就暫時註解掉吧（但build的時候還是會檢查
import AutoImport from 'unplugin-auto-import/vite'
import viteCompression from 'vite-plugin-compression'
import Visualizer from 'rollup-plugin-visualizer'

// import preLoaderMakeId from './src/build/preLoader-makeId'
// import preLoaderExtend from './src/build/preLoader-extend'

// import styleImport, { VantResolve } from 'vite-plugin-style-import'
// import vitePluginImp from 'vite-plugin-imp'

export default ({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd()) }
  return defineConfig({
    base: '/GIS-Map/',
    plugins: [
      vue(),
      viteCompression(),
      Visualizer({ open: true }),
      AutoImport({
        // include: [
        //   /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx,
        //   /\.vue$/, /\.vue\?vue/, // .vue
        // ],
        imports: [
          'vue',
          {
            '@i18n': ['$t']
          }
        ]
      }),
      // preLoaderMakeId(),
      // preLoaderExtend(),
      // checker({ vueTsc: true }), // TS-Check on running "yarn run dev"
      // createSvgIconsPlugin({
      //   iconDirs: [
      //     // resolve(process.cwd(), 'src/assets/icons'),
      //     resolve(process.cwd(), '../core/src/assets/icons')
      //   ],
      //   symbolId: 'icon-[dir]-[name]'
      // }),
      require('autoprefixer'),
      // viteMockServe({
      //   mockPath: '../core/modules/mock',
      //   localEnabled: env.VITE_MOCK === 'ON',
      //   watchFiles: true, // watch on change
      //   prodEnabled: false
      // })
      // styleImport({
      //   resolves: [VantResolve()],
      //   libs: [
      //     {
      //       libraryName: 'vant',
      //       esModule: true,
      //       resolveStyle: (name) => `vant/es/${name}/style/index`,
      //       resolveComponent: (name) => `vant/es/${name}`
      //     }
      //   ]
      // })
      // vitePluginImp({
      //   libList: [
      //     {
      //       libName: 'vant',
      //       style(name) {
      //         return `vant/es/${name}/index.css`
      //       }
      //     }
      //   ]
      // })
    ],
    define: {
      // setting vue-i18-next
      // Suppress warning
      __VUE_I18N_LEGACY_API__: false,
      __VUE_I18N_FULL_INSTALL__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
      // ...getEnv(mode, env)
    },
    // default:{
    //   'import.meta.env._VITE_PUBLICKEY': process.env._VITE_PUBLICKEY
    // },
    resolve: {
      // 這邊如果有新增/修改，記得到 tsconfig.json 同步調整
      alias: {
        '@src': resolve(__dirname, 'src'),
        'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
      }
    },
    server: {
      host: '0.0.0.0',
      port: 3111,
      proxy: {}
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
          drop_debugger: false
        }
      },
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          manualChunks(id) {
            // SvgIcon 自己產生的檔案，根據svg檔案總大小產生，所以要注意svg資料夾中不要存很肥的檔案
            if (id.startsWith('virtual:svg-icons-')) {
              console.log('id',id)
              return 'svg-icon'
            }
            // 切分 node_modules 裡面的東西
            // if (id.includes('node_modules')) {
            //   return id.toString().split('node_modules/')[1].split('/')[0].toString()
            // }
            if (id.includes('node_modules')) {
              const packageName = id.toString().split('node_modules/')[1].split('/')[0]
              // 打包：vue
              if (['@vue'].includes(packageName)) {
                return packageName
              }
              // 打包：vant
              if (['vant'].includes(packageName)) {
                return packageName
              }
              // 打包：swiper ,jsencrypt/lib
              else if (['swiper'].includes(packageName)) {
                return packageName
              }
              // 打包：vue-i18n
              else if (['vue-i18n'].includes(packageName)) {
                return packageName
              }
              // 其他node_modules依賴項放入vendor包
              else {
                return 'vendor'
              }
            }
          }
        },
        // plugins: [
        //   {
        //     name: 'bundle-size-splitter',
        //     generateBundle(options, bundle) {
        //       Object.keys(bundle).forEach(fileName => {
        //         const chunk = bundle[fileName];
        //         if (chunk.type === 'chunk') {
        //           const sizeInKB = chunk.code.length / 1024;
                  
        //           // 如果 chunk 大於 100KB，則進行特殊處理
        //           if (sizeInKB > 100) {
        //             console.log(`${fileName} 大小為 ${sizeInKB}KB`);
        //           }
        //         }
        //       });
        //     }
        //   }
        // ]
      }
    },
    css: {
      devSourcemap: true
    }
  })
}
