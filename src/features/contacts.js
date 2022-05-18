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
  insert,
  getByPage,
  match
} from 'ringcentral-embeddable-extension-common/src/common/db'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
// import { getAllDeals } from './deals'
import { getSessionToken, getFullNumber } from './common'
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
export function formatData (data) {
  return data.data.map(d => {
    const { id, name, owner_id: ownerId, label = '', phone, email, org_id: orgId } = d
    const res = {
      id: (id || '') + '',
      name,
      phoneNumbers: phone.map(p => {
        return {
          phoneNumber: p.value,
          primary: p.primary,
          phoneType: p.label
        }
      }),
      org_id: (orgId || '') + '',
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
  const { target } = e
  const { classList } = target
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
  const dom = document
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
  const token = getSessionToken()
  // let self = await getSelfInfo(token)
  // let uid = self.data.id
  const sort = encodeURIComponent('update_time DESC')
  const url = `${host}/api/v1/persons/list:(cc_email,active_flag,id,name,label,org_id,email,phone,closed_deals_count,open_deals_count,update_time,next_activity_date,owner_id,next_activity_time)?session_token=${token}&strict_mode=true&user_id=&sort=${sort}&label=&start=${start}&type=person&_=${+new Date()}`
  return fetch.get(url)
}

function getOneContact (id) {
  const token = getSessionToken()
  // let self = await getSelfInfo(token)
  // let uid = self.data.id
  const url = `${host}/api/v1/persons/${id}?session_token=${token}&strict_mode=true&user_id=&label=&type=person&_=${+new Date()}`
  return fetch.get(url)
}

export async function syncCurrentContact () {
  console.log('try sync current contact')
  const url = window.location.href
  const reg = /\/person\/(\d+)(.+)?/
  const arr = url.match(reg)
  if (!arr || arr.length < 2) {
    return false
  }
  const id = arr[1]
  const contactData = await getOneContact(id)
  const fmt = await formatData({
    data: [
      contactData.data
    ]
  })
  console.log('try sync current contact data', fmt)
  await insert(fmt).catch(console.debug)
  notifyReSyncContacts()
}

async function fetchAllContacts (_recent) {
  if (!window.rc.userAuthed) {
    showAuthBtn()
    return
  }
  if (window.rc.isFetchingContacts) {
    return
  }
  console.debug('running fetchAllContacts')
  window.rc.isFetchingContacts = true
  loadingContacts()
  const recent = !!_recent
  const lastSync = lastSyncOffset
  let start = await getCache(lastSync) || 0
  let hasMore = true
  while (hasMore) {
    const res = await getContact(start).catch(console.debug)
    if (res && res.data) {
      const final = formatData(res)
      start = _.get(res, 'additional_data.pagination.start') + _.get(res, 'additional_data.pagination.limit')
      hasMore = recent
        ? false
        : _.get(res, 'additional_data.pagination.more_items_in_collection')
      console.debug('fetching, start:', start, ', has more:', hasMore)
      await insert(final).catch(console.debug)
      if (!recent) {
        await setCache(lastSync, start, 'never')
      }
    }
  }
  if (!recent) {
    await setCache(lastSync, 0, 'never')
  }
  const now = Date.now()
  window.rc.syncTimestamp = now
  await ls.set('syncTimestamp', now)
  window.rc.isFetchingContacts = false
  stopLoadingContacts()
  notifyReSyncContacts()
  console.debug('end sync contacts')
  // setTimeout(getAllDeals, 600)
}

/**
 * get contact lists
 */
export const getContacts = async function (page = 1) {
  const final = {
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
  const cached = await getByPage(page).catch(e => console.log(e.stack))
  if (cached && cached.result && cached.result.length) {
    console.debug('use cache')
    return cached
  }
  if (!window.rc.syncTimestamp && !cached.result.length) {
    fetchAllContacts()
  }
  return final
}

export function hideContactInfoPanel () {
  const dom = document
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
  let phone = getFullNumber(_.get(call, 'from')) || _.get(call, 'from')
  if (!phone) {
    return
  }
  phone = formatPhone(phone)
  const contacts = await match([phone], 1)
  const contact = _.get(contacts, `${phone}[0]`)
  if (!contact) {
    return
  }
  // let contactTrLinkElem = canShowNativeContact(contact)
  // if (contactTrLinkElem) {
  //   return showNativeContact(contact, contactTrLinkElem)
  // }
  const url = `${host}/person/${contact.id}`
  const elem = createElementFromHTML(
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
  const old = document
    .querySelector('.rc-contact-panel')
  old && old.remove()

  document.body.appendChild(elem)
  popup()
}

function loadingContacts () {
  const loadingContactsBtn = document.getElementById('rc-reloading-contacts')
  if (loadingContactsBtn) {
    return
  }
  const elem = createElementFromHTML(
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
  const loadingContactsBtn = document.getElementById('rc-reloading-contacts')
  if (loadingContactsBtn) {
    loadingContactsBtn.remove()
  }
}

export function reSyncData (recent) {
  if (!window.rc.userAuthed) {
    showAuthBtn()
    return
  }
  fetchAllContacts(recent)
}

export function notifyReSyncContacts () {
  window.rc.postMessage({
    type: 'rc-adapter-sync-third-party-contacts'
  })
}
