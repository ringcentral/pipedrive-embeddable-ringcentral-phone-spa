/**
 * content config file
 * with proper config,
 * insert `call with ringcentral` button
 * or hover some elemet show call button tooltip
 * or convert phone number text to click-to-call link
 *
 */

/// *
import {
  // RCBTNCLS2,
  checkPhoneNumber
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import { upgrade } from 'ringcentral-embeddable-extension-common/src/feat/upgrade-notification'
//* /

import _ from 'lodash'
import {
  showAuthBtn,
  unAuth,
  doAuth,
  notifyRCAuthed,
  renderAuthButton
} from './features/auth'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'

import {
  showContactInfoPanel,
  getContacts,
  reSyncData
} from './features/contacts'
import {
  getActivities,
  showActivityDetail
} from './features/activities'
import { syncCallLogToThirdParty } from './features/call-log-sync'
import {
  search,
  match
} from 'ringcentral-embeddable-extension-common/src/common/db'

let {
  pageSize = 100
} = thirdPartyConfigs

// insert click to call button
export const insertClickToCallButton = [
  /// *
  {
    // must match page url
    shouldAct: href => {
      return /\/person\/\d+/.test(href)
    },

    // define in the page how to get phone number,
    // if can not get phone number, will not insert the call button
    // support async
    getContactPhoneNumbers: async () => {
      let phones = document.querySelectorAll('.viewContainer:not([style*="none"]) [data-test="phone-label"]')
      return Array.from(phones).map(p => {
        let title = p.parentNode.nextSibling.textContent.trim()
        let id = title
        let number = p.textContent.trim()
        if (checkPhoneNumber(number)) {
          return {
            id,
            title,
            number
          }
        } else {
          return null
        }
      }).filter(d => d)
    },

    // parent dom to insert call button
    // can be multiple condition
    // the first one matches, rest the array will be ignored
    parentsToInsertButton: [
      {
        getElem: () => {
          return document.querySelector('.viewContainer:not([style*="none"]) .detailView.personDetails .infoBlock .spacer')
        },
        insertMethod: 'insertBefore'
      }
    ]
  }
  //* /
]

// hover contact node to show click to dial tooltip
export const hoverShowClickToCallButton = [
  /// *
  // config example
  {
    // must match url
    shouldAct: href => {
      return /\/persons\/list\/user\/(\d+)|everyone/.test(href)
    },

    // elemment selector
    selector: '.gridContent--scrollable .gridContent__table tbody tr',

    // function to get phone numbers, suport async function
    getContactPhoneNumbers: async elem => {
      let phoneNodes = elem.querySelectorAll('td[data-field="phone"] .gridCell__link')
      return Array.from(phoneNodes)
        .map((p, i) => {
          let number = (p.getAttribute('href') || '').replace('callto:', '')
          let title = p.querySelector('.gridCell__valueRemark')
          title = title ? title.textContent.replace(/\(|\)/g, '') : 'Direct'
          return {
            id: 'p_' + i,
            title,
            number
          }
        }).filter(d => checkPhoneNumber(d.number))
    }
  }
  //* /
]

// modify phone number text to click-to-call link
export const phoneNumberSelectors = [
  /// * example config
  {
    shouldAct: (href) => {
      return /\/person\/\d+/.test(href)
    },
    selector: '.fieldsList [data-test="phone-label"]'
  },
  {
    shouldAct: (href) => {
      return /\/person\/\d+/.test(href)
    },
    selector: '[data-test="activity-note"] b'
  },
  {
    shouldAct: (href) => {
      return /\/deal\/\d+/.test(href)
    },
    selector: '[data-test="activity-note"] b'
  }
  //* /
]

/**
 * thirdPartyService config
 * @param {*} serviceName
 */
export function thirdPartyServiceConfig (serviceName) {
  console.log(serviceName, 'serviceName')

  let services = {
    name: serviceName,
    // // show contacts in ringcentral widgets
    contactsPath: '/contacts',
    contactSearchPath: '/contacts/search',
    contactMatchPath: '/contacts/match',

    // show auth/auauth button in ringcentral widgets
    authorizationPath: '/authorize',
    authorizedTitle: 'Unauthorize',
    unauthorizedTitle: 'Authorize',
    authorized: false,

    // Enable call log sync feature
    callLoggerPath: '/callLogger',
    callLoggerTitle: `Log to ${serviceName}`,

    messageLoggerPath: '/messageLogger',
    messageLoggerTitle: `Log to ${serviceName}`,

    // show contact activities in ringcentral widgets
    activitiesPath: '/activities',
    activityPath: '/activity',
    callLogEntityMatcherPath: '/callLogger/match',
    messageLogEntityMatcherPath: '/messageLogger/match'
  }

  // handle ringcentral event
  let handleRCEvents = async e => {
    // console.log(e)
    let { data } = e
    if (!data) {
      return
    }
    console.debug(data)
    let { type, loggedIn, path, call } = data
    if (type === 'rc-login-status-notify') {
      console.debug('rc logined', loggedIn)
      window.rc.rcLogined = loggedIn
    }
    if (
      type === 'rc-route-changed-notify' &&
      path === '/contacts' &&
      !window.rc.userAuthed
    ) {
      showAuthBtn()
    } else if (
      type === 'rc-active-call-notify'
    ) {
      showContactInfoPanel(call)
    } else if (type === 'rc-region-settings-notify') {
      const prevCountryCode = window.rc.countryCode || 'US'
      const newCountryCode = data.countryCode
      if (prevCountryCode !== newCountryCode) {
        reSyncData()
      }
      window.rc.countryCode = data.countryCode
    }
    if (type !== 'rc-post-message-request') {
      return
    }

    let { rc } = window

    if (data.path === '/authorize') {
      if (rc.userAuthed) {
        unAuth()
      } else {
        doAuth()
      }
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: { data: 'ok' }
      })
    } else if (path === '/contacts') {
      let isMannulSync = _.get(data, 'body.type') === 'manual'
      if (isMannulSync) {
        reSyncData()
        rc.postMessage({
          type: 'rc-post-message-response',
          responseId: data.requestId,
          response: {
            data: [],
            nextPage: null,
            syncTimestamp: window.rc.syncTimestamp
          }
        })
        return
      }
      let page = _.get(data, 'body.page') || 1
      let contacts = await getContacts(page)
      let nextPage = ((contacts.count || 0) - page * pageSize > 0) || contacts.hasMore
        ? page + 1
        : null
      let syncTimestamp = _.get(data, 'body.syncTimestamp')
      if (syncTimestamp && syncTimestamp === window.rc.syncTimestamp) {
        nextPage = null
      }
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: {
          data: contacts.result,
          nextPage,
          syncTimestamp: window.rc.syncTimestamp || null
        }
      })
    } else if (path === '/contacts/search') {
      if (!rc.userAuthed) {
        return showAuthBtn()
      }
      let contacts = []
      let keyword = _.get(data, 'body.searchString')
      if (keyword) {
        contacts = await search(keyword)
      }
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: {
          data: contacts
        }
      })
    } else if (path === '/contacts/match') {
      if (!rc.userAuthed) {
        return showAuthBtn()
      }
      let phoneNumbers = _.get(data, 'body.phoneNumbers') || []
      let res = await match(phoneNumbers)
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: {
          data: res
        }
      })
    } else if (path === '/callLogger' || path === '/messageLogger') {
      // add your codes here to log call to your service
      syncCallLogToThirdParty(data.body)
      // response to widget
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: { data: 'ok' }
      })
    } else if (path === '/activities') {
      const activities = await getActivities(data.body)
      /*
      [
        {
          id: '123',
          subject: 'Title',
          time: 1528854702472
        }
      ]
      */
      // response to widget
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: { data: activities }
      })
    } else if (path === '/activity') {
      // response to widget
      showActivityDetail(data.body)
      rc.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: { data: 'ok' }
      })
    }
  }
  return {
    services,
    handleRCEvents
  }
}

/**
 * init third party
 * could init dom insert etc here
 */
export async function initThirdParty () {
  let userAuthed = await ls.get('userAuthed') || false
  window.rc.userAuthed = userAuthed
  window.rc.syncTimestamp = await ls.get('syncTimestamp') || null
  window.rc.syncTimestampDeal = await ls.get('syncTimestampDeal') || null
  // get the html ready
  renderAuthButton()
  if (window.rc.userAuthed) {
    notifyRCAuthed()
  }
  upgrade()
}

// init call with ringcenntral button at page bottom
// enbaled by default, change to false to disable it
export const initCallButton = true
