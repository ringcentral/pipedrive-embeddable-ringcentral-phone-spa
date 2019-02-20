/**
 * call log sync feature
 */

import {thirdPartyConfigs} from 'ringcentral-embeddable-extension-common/src/common/app-config'
import {createForm} from './call-log-sync-form'
import extLinkSvg from 'ringcentral-embeddable-extension-common/src/common/link-external.svg'
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
import {getSessionToken, getContacts} from './contacts'
import {getUserId} from './activities'

let {
  showCallLogSyncForm,
  serviceName
} = thirdPartyConfigs

const userId = getUserId()

/**
 * when sync success, notify success info
 * todo: set real link
 * @param {string} id
 */
export function notifySyncSuccess() {
  let type = 'success'
  let url = `${host}/activities/calendar/user/${userId}`
  let msg = `
    <div>
      <div class="rc-pd1b">
        Call log synced to ${serviceName}!
      </div>
      <div class="rc-pd1b">
        <a href="${url}" target="_blank">
          <img src="${extLinkSvg}" width=16 height=16 class="rc-iblock rc-mg1r" />
          <span class="rc-iblock">
            Check Event Detail
          </span>
        </a>
      </div>
    </div>
  `
  notify(msg, type, 9000)
}

/**
 * sync call log from ringcentral widgets to third party CRM site
 * @param {*} body
 */
export async function syncCallLogToThirdParty(body) {
  // let result = _.get(body, 'call.result')
  // if (result !== 'Call connected') {
  //   return
  // }
  let isManuallySync = !body.triggerType
  let isAutoSync = body.triggerType === 'callLogSync'
  if (!isAutoSync && !isManuallySync) {
    return
  }
  if (!window.rc.userAuthed) {
    return isManuallySync ? showAuthBtn() : null
  }
  if (showCallLogSyncForm && isManuallySync) {
    return createForm(
      body.call,
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
async function getContact(body) {
  if (body.call) {
    let obj = _.find(
      [
        ...body.call.toMatches,
        ...body.call.fromMatches
      ],
      m => m.type === serviceName
    )
    return obj
  }
  else {
    let n = body.direction === 'Outbound'
      ? body.to.phoneNumber
      : body.from.phoneNumber
    let fn = formatPhone(n)
    let contacts = await getContacts()
    let res = _.find(
      contacts,
      contact => {
        let {
          phoneNumbers
        } = contact
        return _.find(phoneNumbers, nx => {
          return fn === formatPhone(nx.phoneNumber)
        })
      }
    )
    return res
  }
}

/**
 * sync call log action
 * todo: need you find out how to do the sync
 * you may check the CRM site to find the right api to do it
 * @param {*} body
 * @param {*} formData 
 */
async function doSync(body, formData) {
  let contact = await getContact(body)
  if (!contact) {
    return notify('no related contact', 'warn')
  }
  let {id, org_id} = contact
  let toNumber = _.get(body, 'call.to.phoneNumber')
  let fromNumber = _.get(body, 'call.from.phoneNumber')
  let {duration} = body.call
  let note = `
    Call from ${fromNumber} to ${toNumber}, duration: ${duration} seconds.
    ${formData.description || ''}`
  let token = getSessionToken()
  let url = `${host}/api/v1/activities?session_token=${token}&strict_mode=true`
  let due_date = moment(body.call.startTime).format('YYYY-MM-DD')
  let s = (duration % 60).toString()
  let m = Math.floor(duration / 60).toString()
  s = s.length > 1 ? s : '0' + s
  m = m.length > 1 ? m : '0' + m
  duration = `${m}:${s}`
  let due_time = moment(body.call.startTime).format('hh:mm')
  let bd = {
    due_date,
    due_time,
    duration,
    note,
    done: true,
    participants: [
      {
        person_id: id,
        primary_flag: true
      }
    ],
    person_id: id,
    org_id,
    assigned_to_user_id: userId
  }
  let res = await fetch.post(url, bd)
  let success = res && res.data
  if (success) {
    notifySyncSuccess({id: ''})
  } else {
    notify('call log sync to third party failed', 'warn')
    console.log('some error')
  }
}

