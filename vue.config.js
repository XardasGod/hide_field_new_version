require('dotenv').config()

const { WEBPACK_PORT } = process.env
const publicPath = `https://localhost:${WEBPACK_PORT}`

module.exports = {
  publicPath,
  configureWebpack: {
    output: {
      library: 'starterpackapp',
      libraryTarget: 'umd'
    }
  },
  chainWebpack: config => {
    // Удаление ненужных плагинов
    config.plugins.delete('html')
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
    config.optimization.delete('splitChunks')

    // Проверяем, что сборка производится в режиме production
      // Включаем минимизацию
      config.optimization.minimize(true)

      // Настраиваем TerserPlugin для удаления console
      config.optimization
        .minimizer('terser')
        .tap(args => {
          const terserOptions = args[0].terserOptions

          // Убедимся, что опции compress существуют
          if (terserOptions.compress) {
            terserOptions.compress.drop_console = true
          } else {
            terserOptions.compress = { drop_console: true }
          }

          return args
        })
  },
  devServer: {
    https: true,
    host: 'localhost',
    port: WEBPACK_PORT,
  }
}