/**
 * content config file
 * with proper config,
 * insert `call with ringcentral` button
 * or hover some elemet show call button tooltip
 * or convert phone number text to click-to-call link
 *
 */

// modify phone number text to click-to-call link
export const phoneNumberSelectors = [
  /// * example config
  {
    shouldAct: (href) => {
      return /\/person\/\d+/.test(href)
    },
    selector: '.fieldsList [data-test="phone-number-button"]'
  },
  {
    shouldAct: (href) => {
      return /(\/persons)?\/list\/user\/(\d+)|everyone/.test(href)
    },
    selector: '[data-test="phone-number-button"]'
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
