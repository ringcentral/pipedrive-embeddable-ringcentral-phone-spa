
const extend = require('recursive-assign')
let config = {

  //build options
  minimize: false,

  //congfigs to build app

  //ringcentral config
  ringCentralConfigs: {
    clientID: '',
    appServer: ''
  },

  //for third party related
  thirdPartyConfigs: {
    showCallLogSyncForm: true,
    serviceName: 'noname'
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



