/**
 * common cross domain request with cookie
 */

import axios from 'axios'
import { envs } from 'ringcentral-embeddable-extension-common'
import logout from '../modules/logout.js'
import { notification } from 'antd'

const {
  apiServer,
  appVersion
} = envs

function handleError ({
  note,
  duration = 10,
  title = 'Warning'
}) {
  notification.warn({
    title,
    description: note,
    duration
  })
}

export default (path, data) => {
  const url = `${apiServer}${path}`
  return axios.post(url, data, {
    withCredentials: true,
    headers: {
      appVersion
    }
  })
    .then(d => d.data)
    .then(data => {
      if (data && data.note) {
        handleError(data)
      }
      return data
    })
    .catch(err => {
      console.error('fetch error', apiServer, path, data, err)
      if (err.message.includes('invalid token')) {
        console.debug('token invalid, should relogin')
        logout()
      }
    })
}
