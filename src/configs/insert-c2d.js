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
      const phones = document.querySelectorAll('.viewContainer:not([style*="none"]) [data-test="phone-number-button"]')
      return Array.from(phones).map((p, i) => {
        const n = p.parentNode.nextSibling || p.nextSibling
        if (!n) {
          return null
        }
        const title = n ? n.textContent.trim() : 'Direct' + i
        const id = title
        const number = p.textContent.trim().replace('*', '#').replace(' ext. ', '#')
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
