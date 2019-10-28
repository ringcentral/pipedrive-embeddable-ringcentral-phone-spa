/*
 * sync call log to deal
 */

import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'
import {
  host, notify
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import { getSessionToken } from './common'
import extLinkSvg from 'ringcentral-embeddable-extension-common/src/common/link-external.svg'
import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import { searchByPersonId } from './deals'

let {
  serviceName
} = thirdPartyConfigs

/**
 * when sync success, notify success info
 * todo: set real link
 * @param {string} id
 */
export function notifySyncSuccess ({
  id,
  logType
}) {
  let type = 'success'
  let url = `${host}/person/${id}`
  let msg = `
    <div>
      <div class="rc-pd1b">
        ${logType} log synced to ${serviceName}!
      </div>
      <div class="rc-pd1b">
        <a href="${url}" target="_blank">
          <img src="${extLinkSvg}" width=16 height=16 class="rc-iblock rc-mg1r" />
          <span class="rc-iblock">
            Check Event Detail
          </span>
        </a>
      </div>
    </div>
  `
  notify(msg, type, 9000)
}

export async function getDeals () {
  let token = getSessionToken()
  let url = `${host}/api/v1/pipelines/1/deals?limit=500&start=0&get_summary=0&totals_convert_currency=default_currency&session_token=${token}&strict_mode=true&status=open`
  let res = await fetch.get(url)
  let success = res && res.data
  return success || []
}

async function syncToDeal (form, deal) {
  let token = getSessionToken()
  let url = `${host}/api/v1/activities?session_token=${token}&strict_mode=true`
  let data = {
    ...form,
    deal_id: deal.id
  }
  let res = await fetch.post(url, data)
  let success = res && res.data
  if (success) {
    notifySyncSuccess({ id: form.person_id, logType: form.subject })
  } else {
    notify('call log sync to deals failed', 'warn')
    console.log('call log sync to deals failed')
  }
}

export async function syncToDeals (form) {
  let deals = await searchByPersonId(form.person_id)
  for (let deal of deals) {
    await syncToDeal(form, deal)
  }
}
