/**
 * react entry
 */

import { initReactApp } from 'ringcentral-embeddable-extension-common'
import MainApp from './main.js'

export default () => {
  const id = 'rc-main-ext'
  initReactApp(
    MainApp,
    {},
    id
  )
}
