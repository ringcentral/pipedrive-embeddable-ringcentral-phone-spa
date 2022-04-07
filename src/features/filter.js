/**
 * filter add/del
 */

import { getSessionToken } from './common'
import {
  host // ,
  // createElementFromHTML
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'
import getFieldId from './person-fields'

export async function addFilter (contact) {
  const token = getSessionToken()
  const fid = await getFieldId()
  const url = `${host}/api/v1/filters?session_token=${token}&strict_mode=true`
  const res = await fetch.post(url, {
    name: 'temp filter, please delete',
    type: 'deals',
    visible_to: '1',
    conditions: {
      glue: 'and',
      conditions: [
        {
          glue: 'and',
          conditions: [
            {
              object: 'person',
              field_id: fid,
              operator: '=',
              value: contact.id,
              extra_value: null
            }
          ]
        },
        {
          glue: 'or',
          conditions: [
          ]
        }
      ]
    }
  })
  if (res && res.data) {
    return res.data.id
  }
}

export async function delFilter (id) {
  const token = getSessionToken()
  const url = `${host}/api/v1/filters/${id}?session_token=${token}&strict_mode=true&active_flag=false`
  await fetch.delete(url)
}
