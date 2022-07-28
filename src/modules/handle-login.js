/**
 * handle login event
 */

import { envs, sendMsgToRCIframe, postMessage } from 'ringcentral-embeddable-extension-common'
import { actions } from '../common/common.js'

const {
  apiServer,
  loginPath
} = envs

const params = 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=500,height=728,right=20,bottom=20'

export function onTriggerLogin () {
  const authUrl = apiServer + loginPath
  window.open(authUrl, '_blank', params)
}

export function onLoginCallback ({ callbackUri }) {
  console.log('onLoginCallback', callbackUri)
  sendMsgToRCIframe({
    type: 'rc-adapter-authorization-code',
    callbackUri
  })
}

export function onLoginChange (loggedIn) {
  postMessage({
    data: {
      loggedIn
    },
    action: actions.updateMainAppState
  })
}
