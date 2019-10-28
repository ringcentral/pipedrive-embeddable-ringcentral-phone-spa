import initBackground from 'ringcentral-embeddable-extension-common/src/spa/background'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'

/**
 * for background.js, check current tab is extension target tab or not
 * @param {object} tab
 */
export function checkTab (tab) {
  return /https:\/\/.+\.pipedrive.com\/.+/.test(tab.url)
  /** url check examples
    tab.url.startsWith('https://app.hubspot.com') &&
    !tab.url.startsWith('https://app.hubspot.com/login') &&
    !tab.url.startsWith('https://app.hubspot.com/myaccounts-beta') &&
    !tab.url.startsWith('https://app.hubspot.com/developer')
   */
}

let list = []
if (thirdPartyConfigs.upgradeServer) {
  list.push(
    new RegExp(
      '^' +
      thirdPartyConfigs.upgradeServer.replace(/\//g, '\\/').replace(/\./g, '\\.')
    )
  )
}

initBackground(checkTab, list)
