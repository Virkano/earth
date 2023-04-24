const { defineConfig } = require('@vue/cli-service')
const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack(config) {
    // 引用路径别名配置
    config.resolve.alias
      .set('@', resolve('src'))
      .set('static', resolve('public/static'))
      .set('images', resolve('src/assets/images'))
      .set('css', resolve('src/assets/css'))
      .set('components', resolve('src/components'))
      .set('utils', resolve('src/utils'))
      .set('views', resolve('src/views'))
  }
})
