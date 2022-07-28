require('dotenv').config()
const _ = require('lodash')
const pack = require('../package.json')

const version = pack.version
exports.minimize = process.env.minimize === 'true'
exports.env = process.env.NODE_ENV
exports.envs = {
  version,
  appVersion: version,
  ..._.pick(
    process.env,
    [
      'clientID',
      'clientSecret',
      'appServer',
      'serviceName',
      'appName',
      'upgradeServer',
      'apiServer',
      'segmentAppName',
      'homePage',
      'download',
      'issue',
      'video',
      'name',
      'loginPath'
    ]
  )
}
