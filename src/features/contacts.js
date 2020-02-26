/**
 * third party contacts related feature
 */

import _ from 'lodash'
import {
  showAuthBtn
} from './auth'
import {
  popup,
  createElementFromHTML,
  formatPhone,
  host
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import { setCache, getCache } from 'ringcentral-embeddable-extension-common/src/common/cache'
import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import {
  remove,
  insert,
  getByPage,
  match
} from 'ringcentral-embeddable-extension-common/src/common/db'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import { getAllDeals } from './deals'
import { getSessionToken } from './common'
// import './add-contacts'

const {
  serviceName
} = thirdPartyConfigs
const lastSyncOffset = 'last-sync-offset'

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
function formatData (data) {
  return data.data.map(d => {
    let { id, name, owner_id: ownerId, label = '', phone, email, org_id: orgId } = d
    let res = {
      id: id + '',
      name,
      phoneNumbers: phone.map(p => {
        return {
          phoneNumber: p.value,
          primary: p.primary,
          phoneType: p.label
        }
      }),
      org_id: orgId + '',
      emails: email.map(r => r.value),
      type: serviceName,
      owner_id: ownerId + '',
      label: (label || '').toString()
    }
    res.phoneNumbersForSearch = res
      .phoneNumbers.map(d => formatPhone(d.phoneNumber)).join(',')
    return res
  })
}

/**
 * click contact info panel event handler
 * @param {Event} e
 */
function onClickContactPanel (e) {
  let { target } = e
  let { classList } = target
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
 * get contact lists function
 * todo: this function need you find out how to do it
 * you may check the CRM site to find the right api to do it
 * or CRM site supply with special api for it
 */
export const getContact = async function (start = 0) {
  let token = getSessionToken()
  // let self = await getSelfInfo(token)
  // let uid = self.data.id
  let url = `${host}/api/v1/persons/list:(cc_email,active_flag,id,name,label,org_id,email,phone,closed_deals_count,open_deals_count,next_activity_date,owner_id,next_activity_time)?session_token=${token}&strict_mode=true&user_id=&sort=&label=&start=${start}&type=person&_=${+new Date()}`
  return fetch.get(url)
}

async function fetchAllContacts () {
  if (window.rc.isFetchingContacts) {
    return
  }
  console.debug('running fetchAllContacts')
  window.rc.isFetchingContacts = true
  loadingContacts()
  let start = await getCache(lastSyncOffset) || 0
  let hasMore = true
  await remove().catch(e => {
    console.log(e.stack)
  })
  while (hasMore) {
    let res = await getContact(start).catch(console.debug)
    if (!res || !res.data) {
      window.rc.isFetchingContacts = false
      return
    }
    let final = formatData(res)
    start = _.get(res, 'additional_data.pagination.start') + _.get(res, 'additional_data.pagination.limit')
    hasMore = _.get(res, 'additional_data.pagination.more_items_in_collection')
    console.debug('fetching, start:', start, ', has more:', hasMore)
    await insert(final).catch(console.debug)
    await setCache(lastSyncOffset, start, 'never')
  }
  await setCache(lastSyncOffset, 0, 'never')
  let now = Date.now()
  window.rc.syncTimestamp = now
  await ls.set('syncTimestamp', now)
  window.rc.isFetchingContacts = false
  stopLoadingContacts()
  notifyReSyncContacts()
  setTimeout(getAllDeals, 600)
}

/**
 * get contact lists
 */
export const getContacts = async function (page = 1) {
  let final = {
    result: [],
    hasMore: false
  }
  if (!window.rc.rcLogined) {
    return final
  }
  if (!window.rc.userAuthed) {
    showAuthBtn()
    return final
  }
  let cached = await getByPage(page).catch(e => console.log(e.stack))
  if (cached && cached.result && cached.result.length) {
    console.debug('use cache')
    return cached
  }
  fetchAllContacts()
  return final
}

export function hideContactInfoPanel () {
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
export async function showContactInfoPanel (call) {
  if (
    !call ||
    call.telephonyStatus !== 'Ringing' ||
    call.direction === 'Outbound'
  ) {
    return
  }
  popup()
  let phone = _.get(call, 'from.phoneNumber') || _.get(call, 'from')
  if (!phone) {
    return
  }
  phone = formatPhone(phone)
  let contacts = await match([phone])
  let contact = _.get(contacts, `${phone}[0]`)
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

function loadingContacts () {
  let loadingContactsBtn = document.getElementById('rc-reloading-contacts')
  if (loadingContactsBtn) {
    return
  }
  let elem = createElementFromHTML(
    `
    <span
      class="rc-reloading-contacts"
      id="rc-reloading-contacts"
      title="Resync contacts to RingCentral Widgets"
    />Syncing contacts</span>
    `
  )
  document.body.appendChild(elem)
}

function stopLoadingContacts () {
  let loadingContactsBtn = document.getElementById('rc-reloading-contacts')
  if (loadingContactsBtn) {
    loadingContactsBtn.remove()
  }
}

export function reSyncData () {
  if (!window.rc.userAuthed) {
    showAuthBtn()
    return
  }
  fetchAllContacts()
}

function notifyReSyncContacts () {
  window.rc.postMessage({
    type: 'rc-adapter-sync-third-party-contacts'
  })
}
