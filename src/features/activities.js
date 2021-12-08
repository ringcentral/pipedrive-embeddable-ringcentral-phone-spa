/**
 * third party activies related feature
 */

import {
  notify,
  host
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import extLinkSvg from 'ringcentral-embeddable-extension-common/src/common/link-external.svg'
import _ from 'lodash'
import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'
import moment from 'moment'
import { getSessionToken } from './common'

/** method to get user unique id, could be email, since it is unique */
export function getUserId () {
  /// * example config
  const cookie = decodeURIComponent(document.cookie)
  const arr = cookie.match(/__vero_user=\d+:(\d+);/)
  const arr1 = cookie.match(/ajs_user_id="\d+:(\d+)"/)
  let id = arr ? arr[1] : ''
  if (!id) {
    id = arr1 ? arr1[1] : ''
  }
  return id
  //* /
}

/**
 * todo:
 * when user click conatct activity item, show activity detail
 * @param {object} body
 */
export function showActivityDetail (body) {
  // console.log(body)
  const { activity = {} } = body
  const {
    subject,
    url,
    note
  } = activity
  const msg = `
    <div>
      <div class="rc-pd1b">
        <a href="${url}">
          <b>
            Subject: ${subject}
            <img width=16 height=16 src="${extLinkSvg}" />
          </b>
        </a>
        <p class="rc-pd1t">
          ${note}
        </p>
      </div>
    </div>
  `
  notify(msg, 'info', 8000)
}

/**
 * todo
 * method to get contact activities from CRM site
 * @param {*} body
 *   /* should return array:
  [
    {
      id: '123',
      subject: 'Title',
      time: 1528854702472
    }
  ]
 */
export async function getActivities (body) {
  const id = _.get(body, 'contact.id')
  if (!id) {
    return []
  }
  const uid = getUserId()
  const token = getSessionToken()
  const limit = 100
  const fm = 'YYYY-MM-DD HH:mm'
  const s = moment().add(-30, 'day').format(fm)
  const e = moment().format(fm)
  const url = `${host}/api/v1/activities?session_token=${token}&start_date=${s}&end_date=${e}&user_id=${uid}&include_duration=1&limit=${limit}`
  const res = await fetch.get(url)
  if (res && res.data) {
    return res.data
      .filter(d => d.person_id + '' === id + '')
      .map(d => {
        const {
          id,
          person_id: pid,
          duration,
          due_date: dueDate,
          subject,
          note,
          due_time: dueTime
        } = d
        return {
          id,
          person_id: pid,
          duration,
          due_date: dueDate,
          subject,
          note,
          due_time: dueTime,
          url: `${host}/activities/calendar/user/${uid}`,
          time: moment(`${dueDate} ${dueTime}`, fm).valueOf()
        }
      })
  } else {
    console.log('fetch events error')
    console.log(res)
  }
  return []
}
