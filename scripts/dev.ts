import { Config, WidgetBuilder } from 'amo-widget-builder'
import { config as commonConfig } from './common'
import { publicPath } from '../vue.config.js'

const config: Config = {
  ...commonConfig,
  entryPoint: `${publicPath}/js/app.js`
}

const builder = new WidgetBuilder(config)

;(async () => {
  await builder.init()
})()
