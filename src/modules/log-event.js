import { createCallLog } from '../common/apis.js'

export function syncRcLog (logs) {
  return createCallLog({ logs })
}
