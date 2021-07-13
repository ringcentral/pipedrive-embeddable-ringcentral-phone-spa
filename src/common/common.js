/**
 * before sync call/message log to third-party
 * show form for call/message log description
 * this feature can be disabled by set config.thirdPartyConfigs.showCallLogSyncForm = false
 */
import {
  formatPhone
} from 'ringcentral-embeddable-extension-common/src/common/helpers'

export function formatPhoneLocal (number) {
  return formatPhone(number, undefined)
}
