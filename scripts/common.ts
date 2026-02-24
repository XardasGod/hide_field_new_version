import { Config } from 'amo-widget-builder'
import * as path from 'path'

export const config: Config = {
  name: {
    ru: 'Мой Первый Виджет'
  },
  description: {
    ru: 'Этот виджет невероятен'
  },
  shortDescription: {
    ru: 'Тут кратенько'
  },
  tourDescription: {
    ru: 'Установи меня!'
  },
  disableAdvancedSettings: true,
  version: '1.0.0',
  manifest: {
    settings: {
      fieldsConfig: {
        name: 'fieldsConfig',
        type: 'text',
        required: false,
      },
    }
  },
  locales: {
    ru: {
      dp: {
        config: 'Настройки'
      }
    }
  },
  locations: ['lcard-0', 'ccard-0', 'settings'],
  bundleDir: path.resolve(__dirname, '../dist'),
  outDir: path.resolve(__dirname, '..')
}
