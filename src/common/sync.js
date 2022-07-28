/**
 * check sync contact progress
 */

import request from './request.js'

export function checkSync () {
  const url = '/pd/check-sync'
  return request(url)
}

export function startSync () {
  const url = '/pd/start-sync?countryCode=' + window._rc.countryCode
  return request(url)
}
