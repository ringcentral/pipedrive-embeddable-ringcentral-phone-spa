const _ = require('lodash')
const keys = [
  'clientID',
  'clientSecret',
  'appServer',
  'serviceName',
  'appName',
  'upgradeServer',
  'dbNameFix',
  'pageSize'
]
const defaultConfig = {
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
const config = _.pick(process.env, keys)
exports.config = config
exports.ringCentralConfigs = config
exports.thirdPartyConfigs = config
Object.assign(exports.thirdPartyConfigs, defaultConfig)
exports.minimize = process.env.minimize === 'true'
