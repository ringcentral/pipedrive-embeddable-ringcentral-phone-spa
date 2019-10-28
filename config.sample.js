/**
 * config sample file
 * use `cp config.sample.js config.js` to create a config
 *
 */
module.exports = {

  /// / dev related

  // minimize content.js
  // minimize: false

  // congfigs to build app

  /// / ringcentral config

  ringCentralConfigs: {
    // your ringCentral app's Client ID
    clientID: '',
    // client secret
    clientSecret: '',
    // your ringCentral app's Auth Server URL
    appServer: 'https://platform.ringcentral.com'
  },

  /// / for third party related

  thirdPartyConfigs: {

    // service name, one word only, such as Insightly, RedTailCRM...
    serviceName: 'serviceName',

    // show call log sync desc form or not
    showCallLogSyncForm: true
  }

}
