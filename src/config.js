/**
 * content config file
 * with proper config,
 * insert `call with ringcentral` button
 * or hover some elemet show call button tooltip
 * or convert phone number text to click-to-call link
 *
 */

import {
  envs,
  callWithRingCentral,
  smsWithRingCentral,
  meetingWithRingCentral
} from 'ringcentral-embeddable-extension-common'
import './custom.styl'

const {
  clientID,
  appServer,
  clientSecret,
  serviceName,
  appVersion,
  segmentAppName,
  segmentKey = '',
  apiServer
} = envs

const authUrl = apiServer + '/rc-oauth'

export * from './modules/convert-c2d.js'
export * from './modules/handle-login.js'
export * from './modules/match-log.js'
export * from './modules/on-init.js'
export * from './modules/on-click-rc-icon.js'
export { searchPhone } from './modules/search.js'

export const widgetSetting = {
  name: envs.name,
  contactMatchPath: '/contacts/match',
  callLoggerPath: '/callLogger',
  callLoggerTitle: 'Log Call',
  messageLoggerPath: '/messageLogger',
  messageLoggerTitle: 'Log SMS'
}
export const widgetParams = {
  appVersion,
  zIndex: 9999,
  prefix: `${serviceName}-rc`,
  newAdapterUI: 1,
  userAgent: `${segmentAppName}/${appVersion}`,
  disableActiveCallControl: false,
  appKey: clientID,
  appSecret: clientSecret,
  appServer,
  disableLoginPopup: 1,
  analyticsKey: segmentKey,
  redirectUri: authUrl
}
export const onCall = callWithRingCentral
export const onSMS = smsWithRingCentral
export const onMeeting = meetingWithRingCentral
