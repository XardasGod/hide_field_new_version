import { Config, WidgetBuilder } from 'amo-widget-builder'
import { config as commonConfig } from './common'

const config: Config = {
  ...commonConfig,
  entryPoint: `js/app.js`
}

const builder = new WidgetBuilder(config)

;(async () => {
  await builder.init()
})()
