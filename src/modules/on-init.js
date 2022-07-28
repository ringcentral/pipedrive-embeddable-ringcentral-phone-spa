import initCallHistoryCheckApp from './history-call-log-handlers.js'
import { actions, postMessage } from 'ringcentral-embeddable-extension-common'
export function onWidgetInited () {
  console.log('onWidgetInited')
  initCallHistoryCheckApp()
  postMessage({
    action: actions.updateRcMainState,
    data: {
      showRc: true,
      showMeeting: true
    }
  })
}
