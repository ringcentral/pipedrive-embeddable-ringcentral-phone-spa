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

// hover contact node to show click to dial tooltip
export const hoverShowClickToCallButton = [
  /// *
  // config example
  {
    // must match url
    shouldAct: href => {
      return /(\/persons)?\/list\/user\/(\d+)|everyone/.test(href)
    },

    // elemment selector
    selector: '.gridContent--scrollable .gridContent__table tbody tr',

    // function to get phone numbers, suport async function
    getContactPhoneNumbers: async elem => {
      let phoneNodes = elem.querySelectorAll('[data-test="phone-number-button"]')
      if (!phoneNodes.length) {
        phoneNodes = elem.querySelectorAll('td[data-field="person.phone"]')
      }
      return Array.from(phoneNodes)
        .map((p, i) => {
          const nn = p.parentNode.nextSibling
          let number = p ? p.textContent.trim() : ''
          let title = nn ? nn.textContent : 'Direct'
          title = title.trim()
          number = number.replace('*', '#').replace(' ext. ', '#')
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
