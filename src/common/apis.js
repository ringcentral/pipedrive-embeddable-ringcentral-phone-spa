/**
 * check sync contact progress
 */

import request from './request.js'
import dayjs from 'dayjs'

export function createCallLog (data) {
  const url = '/pd/create-log'
  return request(
    url,
    data
  )
}

export function createSMSLog (data) {
  const url = '/pd/create-log-sms'
  return request(
    url,
    data
  )
}

export function checkCallLog (sessionIds) {
  const url = '/pd/check-log'
  return request(url, {
    sessionIds
  })
}

export function updateSetting (settings) {
  const url = '/pd/update-rc-setting'
  return request(url, settings)
}

export function createContact (data) {
  const url = '/pd/create-contact'
  return request(
    url,
    data
  )
}

export function getContact (data) {
  const url = '/pd/get-contact'
  return request(
    url,
    data
  )
}

export function getRcCallLogs (phone) {
  const from = dayjs().add(-15, 'days').format('YYYY-MM-DD')
  const url = `/rc/get-rc-call-logs?phone=${encodeURIComponent(phone)}&from=${encodeURIComponent(from)}`
  return request(url)
}
