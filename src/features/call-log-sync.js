/**
 * call log sync feature
 */

import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import { createForm, formatPhoneLocal, getContactInfo } from './call-log-sync-form'
import {
  showAuthBtn
} from './auth'
import _ from 'lodash'
import {
  notify,
  host,
  formatPhone
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'
import moment from 'moment'
import { getSessionToken } from './common'
import {
  match
} from 'ringcentral-embeddable-extension-common/src/common/db'
import { getUserId } from './activities'
import { notifySyncSuccess, getDealId } from './call-log-sync-to-deal'

let {
  showCallLogSyncForm,
  serviceName
} = thirdPartyConfigs

const userId = getUserId()

/**
 * sync call log from ringcentral widgets to third party CRM site
 * @param {*} body
 */
export async function syncCallLogToThirdParty (body) {
  // let result = _.get(body, 'call.result')
  // if (result !== 'Call connected') {
  //   return
  // }
  let isManuallySync = !body.triggerType || body.triggerType === 'manual'
  let isAutoSync = body.triggerType === 'callLogSync' || body.triggerType === 'auto'
  if (!isAutoSync && !isManuallySync) {
    return
  }
  if (_.get(body, 'sessionIds')) {
    return
  }
  if (!window.rc.userAuthed) {
    return isManuallySync ? showAuthBtn() : null
  }
  if (showCallLogSyncForm && isManuallySync) {
    let contactRelated = await getContactInfo(body, serviceName)
    if (
      !contactRelated ||
      (!contactRelated.froms && !contactRelated.tos)
    ) {
      return notify('No related contact')
    }
    return createForm(
      body,
      serviceName,
      (formData) => doSync(body, formData)
    )
  } else {
    doSync(body, {})
  }
}

/**
 * get contact id
 * @param {object} body
 */
async function getSyncContacts (body) {
  let all = []
  if (body.call) {
    let nf = _.get(body, 'to.phoneNumber') ||
      _.get(body, 'call.to.phoneNumber')
    let nt = _.get(body, 'from.phoneNumber') ||
      _.get(body.call, 'from.phoneNumber')
    all = [nt, nf]
  } else {
    all = [
      _.get(body, 'conversation.self.phoneNumber'),
      ...body.conversation.correspondents.map(d => d.phoneNumber)
    ]
  }
  all = all.map(s => formatPhone(s)).filter(d => d)
  let contacts = await match(all)
  let arr = Object.keys(contacts).reduce((p, k) => {
    return [
      ...p,
      ...contacts[k]
    ]
  }, [])
  return _.uniqBy(arr, d => d.id)
}

/**
 * sync call log action
 * todo: need you find out how to do the sync
 * you may check the CRM site to find the right api to do it
 * @param {*} body
 * @param {*} formData
 */
async function doSync (body, formData) {
  let contacts = await getSyncContacts(body)
  // console.log(contacts, 'ccccc')
  if (!contacts.length) {
    return notify('No related contacts')
  }
  for (let contact of contacts) {
    await doSyncOne(contact, body, formData)
  }
}

function buildMsgs (body) {
  let msgs = _.get(body, 'conversation.messages')
  let arr = msgs.map(m => {
    let desc = m.direction === 'Outbound'
      ? 'to'
      : 'from'
    let n = m.direction === 'Outbound'
      ? m.to
      : [m.from]
    n = n.map(m => formatPhoneLocal(m.phoneNumber)).join(', ')
    return `<li><b>${m.subject}</b> - ${desc} <b>${n}</b> - ${moment(m.creationTime).format('MMM DD, YYYY HH:mm')}</li>`
  })
  return `<h3>SMS logs:</h3><ul>${arr.join('')}</ul>`
}

function buildVoiceMailMsgs (body) {
  let msgs = _.get(body, 'conversation.messages')
  let arr = msgs.map(m => {
    let isOut = m.direction === 'Outbound'
    let desc = isOut
      ? 'to'
      : 'from'
    let n = isOut
      ? m.to
      : [m.from]
    n = n.map(m => formatPhoneLocal(m.phoneNumber || m.extensionNumber)).join(', ')
    let links = m.attachments.map(t => t.link).join(', ')
    return `<li>${links} - ${n ? desc : ''} <b>${n}</b> ${moment(m.creationTime).format('MMM DD, YYYY HH:mm')}</li>`
  })
  return `<h3>Voice mail logs:</h3><ul>${arr.join('')}</ul>`
}

/**
 * sync call log action
 * todo: need you find out how to do the sync
 * you may check the CRM site to find the right api to do it
 * @param {*} body
 * @param {*} formData
 */
async function doSyncOne (contact, body, formData) {
  let { id, org_id: oid } = contact
  let toNumber = _.get(body, 'call.to.phoneNumber')
  let fromNumber = _.get(body, 'call.from.phoneNumber')
  let duration = _.get(body, 'call.duration') || 0
  let recording = _.get(body, 'call.recording')
    ? `<p>Recording link: ${body.call.recording.link}</p>`
    : ''
  let token = getSessionToken()
  let url = `${host}/api/v1/activities?session_token=${token}&strict_mode=true`
  let time = _.get(body, 'call.startTime') ||
    _.get('body', 'conversation.messages[0].creationTime')
  let dueDate = moment.utc(time).format('YYYY-MM-DD')
  let h = Math.floor(duration / 3600).toString()
  let m = Math.ceil((duration - h * 3600) / 60).toString()
  // let s = Math.floor(duration % 60).toString()
  h = h.length > 1 ? h : '0' + h
  // s = s.length > 1 ? s : '0' + s
  m = m.length > 1 ? m : '0' + m
  duration = `${h}:${m}`
  let dueTime = moment.utc(time).format('HH:mm')
  let mainBody = ''
  let ctype = _.get(body, 'conversation.type')
  let isVoiceMail = ctype === 'VoiceMail'
  if (body.call) {
    mainBody = `[${_.get(body, 'call.direction')} ${_.get(body, 'call.result')}] CALL from <b>${body.call.fromMatches.map(d => d.name).join(', ')}</b>(<b>${formatPhoneLocal(fromNumber)}</b>) to <b>${body.call.toMatches.map(d => d.name).join(', ')}</b>(<b>${formatPhoneLocal(toNumber)}</b>)`
  } else if (ctype === 'SMS') {
    mainBody = buildMsgs(body)
  } else if (isVoiceMail) {
    mainBody = buildVoiceMailMsgs(body)
  }
  let logType = body.call ? 'Call' : ctype
  let bodyAll = `<p>${formData.description || ''}</p><p>${mainBody}</p>${recording}`
  let bd = {
    due_date: dueDate,
    due_time: dueTime,
    duration,
    note: bodyAll,
    type: 'call',
    subject: logType,
    done: true,
    participants: [
      {
        person_id: id,
        primary_flag: true
      }
    ],
    person_id: id,
    org_id: oid,
    deal_id: null,
    notification_language_id: 1,
    assigned_to_user_id: userId
  }
  let dealId = await getDealId(bd)
  if (dealId) {
    bd.deal_id = dealId
  }
  let res = await fetch.post(url, bd)
  let success = res && res.data
  if (success) {
    notifySyncSuccess({ id, logType })
  } else {
    notify('call log sync to third party failed', 'warn')
  }
}
