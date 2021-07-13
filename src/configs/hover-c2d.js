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
      return /\/persons\/list\/user\/(\d+)|everyone/.test(href)
    },

    // elemment selector
    selector: '.gridContent--scrollable .gridContent__table tbody tr',

    // function to get phone numbers, suport async function
    getContactPhoneNumbers: async elem => {
      let phoneNodes = elem.querySelectorAll('td[data-field="phone"] .value button')
      return Array.from(phoneNodes)
        .map((p, i) => {
          let nn = p.querySelector('span:not([class])')
          let number = nn ? nn.textContent.trim() : ''
          let title = p.querySelector('.gridCell__valueRemark')
          let title0 = title ? title.textContent : 'Direct'
          title0 = title0.trim()
          title = title0.replace(/\(|\)/g, '')
          title = title.trim()
          number = number.replace(title0, '').replace('*', '#').replace(' ext. ', '#')
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
