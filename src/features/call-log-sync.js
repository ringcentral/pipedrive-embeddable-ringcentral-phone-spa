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
import { getSessionToken, autoLogPrefix } from './common'
import {
  match
} from 'ringcentral-embeddable-extension-common/src/common/db'
import { getUserId } from './activities'
import { notifySyncSuccess, getDealId } from './call-log-sync-to-deal'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import copy from 'json-deep-copy'

let {
  showCallLogSyncForm,
  serviceName
} = thirdPartyConfigs

let prev = {
  time: Date.now(),
  sessionId: '',
  body: {}
}

const userId = getUserId()

function checkMerge (body) {
  const maxDiff = 100
  const now = Date.now()
  const sid = _.get(body, 'conversation.conversationId')
  const type = _.get(body, 'conversation.type')
  if (type !== 'SMS') {
    return body
  }
  if (prev.sessionId === sid && prev.time - now < maxDiff) {
    let msgs = [
      ...body.conversation.messages,
      ...prev.body.conversation.messages
    ]
    msgs = _.uniqBy(msgs, (e) => e.id)
    body.conversation.messages = msgs
    prev.body = copy(body)
    return body
  } else {
    prev.time = now
    prev.sessionId = sid
    prev.body = copy(body)
    return body
  }
}

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
    body = checkMerge(body)
    let contactRelated = await getContactInfo(body, serviceName)
    if (
      !contactRelated ||
      (!contactRelated.froms && !contactRelated.tos)
    ) {
      const b = copy(body)
      b.type = 'rc-show-add-contact-panel'
      return window.postMessage(b, '*')
    }
    return createForm(
      body,
      serviceName,
      (formData) => doSync(body, formData, isManuallySync)
    )
  } else {
    doSync(body, {}, isManuallySync)
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
async function doSync (body, formData, isManuallySync) {
  let contacts = await getSyncContacts(body)
  // console.log(contacts, 'ccccc')
  if (!contacts.length) {
    return notify('No related contacts')
  }
  for (let contact of contacts) {
    await doSyncOne(contact, body, formData, isManuallySync)
  }
}

function buildMsgs (body) {
  let msgs = _.get(body, 'conversation.messages')
  const arr = []
  for (const m of msgs) {
    let desc = m.direction === 'Outbound'
      ? 'to'
      : 'from'
    let n = m.direction === 'Outbound'
      ? m.to
      : [m.from]
    n = n.map(m => formatPhoneLocal(m.phoneNumber)).join(', ')
    arr.push({
      body: `<p>SMS: <b>${m.subject}</b> - ${desc} <b>${n}</b> - ${moment(m.creationTime).format('MMM DD, YYYY HH:mm')}</p>`,
      id: m.id
    })
  }
  return arr
}

function buildVoiceMailMsgs (body) {
  let msgs = _.get(body, 'conversation.messages')
  const arr = []
  for (const m of msgs) {
    let isOut = m.direction === 'Outbound'
    let desc = isOut
      ? 'to'
      : 'from'
    let n = isOut
      ? m.to
      : [m.from]
    n = n.map(m => formatPhoneLocal(m.phoneNumber || m.extensionNumber)).join(', ')
    let links = m.attachments.map(t => t.link).join(', ')
    arr.push({
      body: `<p>Voice mail: ${links} - ${n ? desc : ''} <b>${n}</b> ${moment(m.creationTime).format('MMM DD, YYYY HH:mm')}</p>`,
      id: m.id
    })
  }
  return arr
}

function buildKey (id) {
  return `rc-log-${userId}-${id}`
}

async function saveLog (id, engageId) {
  const key = buildKey(id)
  await ls.set(key, engageId)
}

async function filterLoggered (arr) {
  const res = []
  for (const m of arr) {
    const key = buildKey(m.id)
    const ig = await ls.get(key)
    if (!ig) {
      res.push(m)
    }
  }
  return res
}

/**
 * sync call log action
 * todo: need you find out how to do the sync
 * you may check the CRM site to find the right api to do it
 * @param {*} body
 * @param {*} formData
 */
async function doSyncOne (contact, body, formData, isManuallySync) {
  let { id, org_id: oid } = contact
  let desc = formData.description
  const sid = _.get(body, 'call.telephonySessionId') || 'not-exist'
  const sessid = autoLogPrefix + sid
  if (!isManuallySync) {
    desc = await ls.get(sessid) || ''
  }
  let toNumber = _.get(body, 'call.to.phoneNumber')
  let fromNumber = _.get(body, 'call.from.phoneNumber')
  let duration = _.get(body, 'call.duration') || 0
  let recording = _.get(body, 'call.recording')
    ? `<p>Recording link: ${body.call.recording.link}</p>`
    : ''
  let token = getSessionToken()
  let externalId = body.id ||
    _.get(body, 'call.sessionId') ||
    _.get(body, 'conversation.conversationLogId')
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
  if (!_.isArray(mainBody)) {
    mainBody = [{
      body: mainBody,
      id: externalId
    }]
  }
  if (!isManuallySync) {
    mainBody = await filterLoggered(mainBody)
  }
  let bodyAll = mainBody.map(mm => {
    return {
      id: mm.id,
      body: `<p>${desc || ''}</p><p>${mm.body}</p>${recording}`
    }
  })
  for (const uit of bodyAll) {
    let bd = {
      due_date: dueDate,
      due_time: dueTime,
      duration,
      note: uit.body,
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
    let dealId = await getDealId(contact)
    if (dealId) {
      bd.deal_id = dealId
    }
    let res = await fetch.post(url, bd)
    let success = res && res.data
    if (success) {
      await saveLog(uit.id, res.data.id)
      notifySyncSuccess({ id, logType })
    } else {
      notify('call log sync to third party failed', 'warn')
    }
  }
  if (!isManuallySync) {
    await ls.remove(sessid)
  }
}
