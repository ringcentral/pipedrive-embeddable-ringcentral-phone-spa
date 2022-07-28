import { postMessage } from 'ringcentral-embeddable-extension-common'
import { actions } from '../common/common.js'

export function onClickRcIcon () {
  postMessage({
    action: actions.updateMainAppState,
    data: {
      modalVisible: true
    }
  })
}