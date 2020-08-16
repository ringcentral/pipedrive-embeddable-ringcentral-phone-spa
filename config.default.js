
const extend = require('recursive-assign')
let config = {

  // build options
  minimize: false,

  // congfigs to build app

  // ringcentral config
  ringCentralConfigs: {
    // your ringCentral app's Client ID
    clientID: '',

    // client secret
    clientSecret: '',

    // your ringCentral app's Auth Server URL
    appServer: 'https://platform.ringcentral.com'
  },

  // for third party related
  thirdPartyConfigs: {
    showCallLogSyncForm: true,
    serviceName: 'serviceName',
    appName: 'pipedrive-embeddable-ringcentral-phone-spa',
    pageSize: 200000,
    dbSchema: {
      org_id: {
        dataType: 'string'
      },
      owner_id: {
        dataType: 'string'
      },
      label: {
        dataType: 'string'
      }
    }
  }

}

try {
  extend(config, require('./config.js'))
} catch (e) {
  if (e.stack.includes('Cannot find module \'./config.js\'')) {
    console.warn('no custom config file, it is ok, but you can use "cp config.sample.js config.js" to create one')
  } else {
    console.log(e)
  }
}
module.exports = config
