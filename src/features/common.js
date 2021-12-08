/**
 * common functions
 */
import _ from 'lodash'

/**
 * get session token for request from server
 */
export function getSessionToken () {
  const { cookie } = document
  const arr = cookie.match(/pipe-session-token=([^;]+);/)
  return arr ? arr[1] : ''
}

export const autoLogPrefix = 'rc-auto-log-id:'
/**
 * get current user info
 * @param {string} token
 */
// export function getSelfInfo (token = getSessionToken()) {
//   return fetch.get(`${host}/api/v1/users/self?session_token=${token}&strict_mode=true&_=${+new Date()}`)
// }
export function getFullNumber (numberObj) {
  if (!numberObj) {
    return ''
  } else if (_.isString(numberObj)) {
    return numberObj
  }
  const {
    extensionNumber,
    phoneNumber = ''
  } = numberObj
  return phoneNumber +
    (extensionNumber ? '#' + extensionNumber : '')
}
