/**
 * before sync call/message log to third-party
 * show form for call/message log description
 * this feature can be disabled by set config.thirdPartyConfigs.showCallLogSyncForm = false
 */
import {
  createElementFromHTML,
  notify,
  formatPhone
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import _ from 'lodash'
import moment from 'moment'
import {
  match
} from 'ringcentral-embeddable-extension-common/src/common/db'
import { getFullNumber } from './common'

export function formatPhoneLocal (number) {
  return formatPhone(number, undefined)
}

function onCancel () {
  document.querySelector('.rc-sync-form').classList.remove('rc-sync-show')
}

let handler = null

function clean () {
  clearTimeout(handler)
}

export async function getContactInfo (body, serviceName) {
  if (!body) {
    return
  }
  let froms = []
  let tos = []
  let time
  let fromText = 'from'
  let toText = 'to'
  if (body.call) {
    // for call
    froms = _.get(body, 'call.fromMatches') || []
    tos = _.get(body, 'call.toMatches') || []
    if (!froms.length && !tos.length) {
      return
    }
    time = moment(body.call.startTime).format()
  } else if (
    _.get(body, 'conversation.type') === 'SMS' ||
    _.get(body, 'conversation.type') === 'VoiceMail'
  ) {
    // for sms
    fromText = 'Correspondents'
    toText = 'Correspondents'
    tos = _.get(body, 'correspondentEntity')
    tos = tos ? [tos] : []
    let selfNumber = getFullNumber(_.get(body, 'conversation.self'))
    froms = await match([selfNumber])

    froms = froms[selfNumber] || []
    time = _.get(body, 'conversation.date')
    if (!tos.length && !froms.length) {
      return
    }
  } else {
    // todo fax support
    notify(`Do not support ${_.get(body, 'conversation.type')} yet`)
    return
  }
  froms = froms
    .filter(d => d.type === serviceName)
    .map(d => d.name)
  if (!froms.length) {
    froms = ''
  } else {
    froms = froms.join(', ')
    let f = formatPhoneLocal(getFullNumber(_.get(body, 'call.from')) || getFullNumber(_.get(body, 'conversation.self')))
    froms = `<li>
      <b>${fromText}:</b> ${f}${froms ? '(' + froms + ')' : ''}
    </li>`
  }
  tos = tos
    .filter(d => d.type === serviceName)
    .map(d => d.name)
  if (!tos.length) {
    tos = ''
  } else {
    tos = tos.join(', ')
    let t = formatPhoneLocal(getFullNumber(_.get(body, 'call.to')))
    tos = `<li>
      <b>${toText}:</b> ${t}${tos ? '(' + tos + ')' : '-'}</b>
    </li>
    `
  }
  return {
    froms,
    tos,
    time
  }
}

/**
 *
 * @param {object} call, the call info object
 * @param {string} serviceName
 * @param {function} onSubmit, (formData) => ...trigger when submit the form, supply with form data, such as {description}
 */
export async function createForm (body, serviceName, onSubmit) {
  if (!body || (!body.call && !body.conversation)) {
    return
  }
  clean()
  let res = await getContactInfo(body, serviceName)
  if (!res) {
    return
  }
  let { froms, tos, time } = res
  // let wrapper = document.getElementById('rc-widget')
  let dom = createElementFromHTML(`
    <form class="rc-sync-form animate">
      <div class="rc-sync-inner rc-pd2">
        <h3 class="rc-sync-title rc-pd1b bold">
          Sync call log to ${serviceName}
        </h3>
        <ul class="rc-pd1b">
          ${froms}${tos}
          <li>
            <b>time:</b> ${time}
          </li>
        </ul>
        <textarea
          value=""
          class="rc-sync-area"
          rows="5"
          placeholder="optional description"
        ></textarea>
        <div class="rc-pd1b rc-sync-btns">
          <button class="rc-sync-btn rc-btn-cancel rc-mg1r" type="button">Cancel</button>
          <button class="rc-sync-btn rc-btn-submit" type="submit">Submit</button>
        </div>
      </div>
    </form>
  `)
  dom.onsubmit = e => {
    e.preventDefault()
    let v = dom.querySelector('.rc-sync-area').value
    onSubmit({
      description: v || ''
    })
    onCancel()
  }
  dom.querySelector('.rc-btn-cancel').onclick = onCancel
  // dom.querySelector('.rc-sync-area').onchange = e => {
  //   e.preventDefault()
  //   onSubmit()
  // }
  let old = document.querySelector('.rc-sync-form')
  old && old.remove()
  document.getElementById('Pipedrive-rc').appendChild(dom)
  handler = setTimeout(() => {
    dom.classList.add('rc-sync-show')
  }, 100)
}
