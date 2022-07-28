/**
 * react entry
 */

import { initReactApp } from 'ringcentral-embeddable-extension-common'
import App from './history-call-log.js'

export default () => {
  const id = 'rc-call-history-entry'
  initReactApp(
    App,
    {},
    id
  )
}
