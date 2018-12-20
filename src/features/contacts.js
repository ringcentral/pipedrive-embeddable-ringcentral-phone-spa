/**
 * third party contacts related feature
 */

import _ from 'lodash'
import {setCache, getCache} from 'ringcentral-embeddable-extension-common/src/common/cache'
import {
  showAuthBtn
} from './auth'
import {
  popup,
  createElementFromHTML,
  formatPhone,
  host
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'
import {thirdPartyConfigs} from 'ringcentral-embeddable-extension-common/src/common/app-config'

let {
  serviceName
} = thirdPartyConfigs

let cacheKey = 'ls-contacts'
/**
 * get session token for request from server
 */
export function getSessionToken() {
  let {cookie} = document
  let arr = cookie.match(/pipe-session-token=([^;]+);/)
  return arr ? arr[1] : ''
}

/**
 * get current user info
 * @param {string} token
 */
export function getSelfInfo(token = getSessionToken()) {
  return fetch.get(`${host}/api/v1/users/self?session_token=${token}&strict_mode=true&_=${+new Date()}`)
}

/**
 * convert pipedrive contact data to ringcentral format data
 * @param {object} data
 * @return [{
    id: '123456', // id to identify third party contact
    name: 'TestService Name', // contact name
    type: 'TestService', // need to same as service name
    phoneNumbers: [{
      phoneNumber: '+1234567890',
      phoneType: 'directPhone'
    }],
    emails: ['test@email.com']
  }]
 */
function formatData(data) {
  return data.data.map(d => {
    let {id, name, owner_id, label, phone, email, org_id} = d
    return {
      id,
      name,
      phoneNumbers: phone.map(p => {
        return {
          phoneNumber: p.value,
          primary: p.primary,
          phoneType: p.label
        }
      }),
      org_id,
      emails: email.map(r => r.value),
      type: serviceName,
      owner_id,
      label
    }
  })
}

/**
 * click contact info panel event handler
 * @param {Event} e
 */
function onClickContactPanel (e) {
  let {target} = e
  let {classList} = target
  if (classList.contains('rc-close-contact')) {
    document
      .querySelector('.rc-contact-panel')
      .classList.add('rc-hide-to-side')
  }
}

/**
 * conatct info iframe loaded event
 */
function onloadIframe () {
  let dom = document
    .querySelector('.rc-contact-panel')
  dom && dom.classList.add('rc-contact-panel-loaded')
}

/**
 * search contacts by number match
 * @param {array} contacts
 * @param {string} keyword
 */
export function findMatchContacts(contacts = [], numbers) {
  let {formatedNumbers, formatNumbersMap} = numbers.reduce((prev, n) => {
    let nn = formatPhone(n)
    prev.formatedNumbers.push(nn)
    prev.formatNumbersMap[nn] = n
    return prev
  }, {
    formatedNumbers: [],
    formatNumbersMap: {}
  })
  let res = contacts.filter(contact => {
    let {
      phoneNumbers
    } = contact
    return _.find(phoneNumbers, n => {
      return formatedNumbers
        .includes(
          formatPhone(n.phoneNumber)
        )
    })
  })
  return res.reduce((prev, it) => {
    let phone = _.find(it.phoneNumbers, n => {
      return formatedNumbers.includes(
        formatPhone(n.phoneNumber)
      )
    })
    let num = phone.phoneNumber
    let key = formatNumbersMap[
      formatPhone(num)
    ]
    if (!prev[key]) {
      prev[key] = []
    }
    let res = {
      id: it.id, // id to identify third party contact
      type: serviceName, // need to same as service name
      name: it.name,
      phoneNumbers: it.phoneNumbers
    }
    prev[key].push(res)
    return prev
  }, {})
}


/**
 * search contacts by keyword
 * @param {array} contacts
 * @param {string} keyword
 */
export function searchContacts(contacts = [], keyword) {
  return contacts.filter(contact => {
    let {
      name,
      phoneNumbers
    } = contact
    return name.includes(keyword) ||
      _.find(phoneNumbers, n => {
        return n.phoneNumber.includes(keyword)
      })
  })
}

/**
 * get contact lists function
 * todo: this function need you find out how to do it
 * you may check the CRM site to find the right api to do it
 * or CRM site supply with special api for it
 */
export const getContacts = _.debounce(async function getContacts() {
  if (!window.rc.rcLogined) {
    return []
  }
  if (!window.rc.userAuthed) {
    showAuthBtn()
    return []
  }
  let cached = await getCache(cacheKey)
  if (cached) {
    console.log('use cache')
    return cached
  }
  let token = getSessionToken()
  let self = await getSelfInfo(token)
  let uid = self.data.id
  let url = `${host}/api/v1/persons/list:(cc_email,active_flag,id,name,label,org_id,email,phone,closed_deals_count,open_deals_count,next_activity_date,owner_id,next_activity_time)?session_token=${token}&strict_mode=true&user_id=${uid}&sort=&label=&start=0&type=person&_=${+new Date()}`
  let data = await fetch.get(url)

  let final = formatData(data)
  await setCache(cacheKey, final)
  return final
}, 100, {
  leading: true
})

export function hideContactInfoPanel() {
  let dom = document
    .querySelector('.rc-contact-panel')
  dom && dom.classList.add('rc-hide-to-side')
}

/**
 * show caller/callee info
 * todo: you need find out right url for conact to show it when calling
 * you may check the CRM site to find the right api to do it
 * @param {Object} call
 */
export async function showContactInfoPanel(call) {
  if (
    !call.telephonyStatus ||
    call.telephonyStatus === 'CallConnected'
  ) {
    return
  }
  if (call.telephonyStatus === 'NoCall') {
    return hideContactInfoPanel()
  }
  let isInbound = call.direction === 'Inbound'
  let phone = isInbound
    ? _.get(
      call,
      'from.phoneNumber'
    )
    : _.get(call, 'to.phoneNumber')
  if (!phone) {
    return
  }
  phone = formatPhone(phone)
  let contacts = await getContacts()
  let contact = _.find(contacts, c => {
    return _.find(c.phoneNumbers, p => {
      return formatPhone(p.phoneNumber) === phone
    })
  })
  if (!contact) {
    return
  }
  // let contactTrLinkElem = canShowNativeContact(contact)
  // if (contactTrLinkElem) {
  //   return showNativeContact(contact, contactTrLinkElem)
  // }
  let url = `${host}/person/${contact.id}`
  let elem = createElementFromHTML(
    `
    <div class="animate rc-contact-panel" draggable="false">
      <div class="rc-close-box">
        <div class="rc-fix rc-pd2x">
          <span class="rc-fleft">Contact</span>
          <span class="rc-fright">
            <span class="rc-close-contact">&times;</span>
          </span>
        </div>
      </div>
      <div class="rc-third-party-contact-frame-box">
        <iframe class="rc-third-party-contact-frame" sandbox="allow-same-origin allow-scripts allow-forms allow-popups" allow="microphone" src="${url}" id="rc-third-party-contact-frame">
        </iframe>
      </div>
      <div class="rc-loading">loading...</div>
    </div>
    `
  )
  elem.onclick = onClickContactPanel
  elem.querySelector('iframe').onload = onloadIframe
  let old = document
    .querySelector('.rc-contact-panel')
  old && old.remove()

  document.body.appendChild(elem)
  popup()
}
