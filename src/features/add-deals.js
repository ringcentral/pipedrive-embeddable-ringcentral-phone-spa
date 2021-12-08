/**
 * add contacts
 */

/**
 * https://20191010-1c32d5.pipedrive.com/api/v1/deals?session_token=203458d1a15a7e2ee237794134057a2d&strict_mode=true

:authority: 20191010-1c32d5.pipedrive.com
:method: POST
:path: /api/v1/deals?session_token=203458d1a15a7e2ee237794134057a2d&strict_mode=true
:scheme: https
accept: application/json, text/javascript, ; q=0.01
accept-encoding: gzip, deflate, br
accept-language: en,zh-CN;q=0.9,zh;q=0.8
content-length: 121
content-type: application/json
cookie: pd_language_selection=en; ajs_group_id=null; _ga=GA1.2.173106858.1559715460; device_id=LVKIHY_AGoowGEHmqs_OzCy9; has_account=1; _fbp=fb.1.1559715985195.555704607; split_tests=%7B%22190819uxmission%22%3A%22b%22%2C%222ndcta290419%22%3A%22b%22%7D; _gcl_au=1.1.1200628266.1567722564; optimizelyEndUserId=oeu1568593205461r0.508154798716431; pd_cookie-policy-agreement=1; _hjid=77a92b93-c103-4e1c-8cdb-f1a07f4559cc; amplitude_idundefinedpipedrive.com=eyJvcHRPdXQiOmZhbHNlLCJzZXNzaW9uSWQiOm51bGwsImxhc3RFdmVudFRpbWUiOm51bGwsImV2ZW50SWQiOjAsImlkZW50aWZ5SWQiOjAsInNlcXVlbmNlTnVtYmVyIjowfQ==; amplitude_id_ef651cb38f5e1e69be707ede7f95fdc0pipedrive.com=eyJkZXZpY2VJZCI6ImY1ZjgyNmM2LWZjODktNGU0Yi1iZDRhLTQ4Zjk1ZGFmMTFiOCIsInVzZXJJZCI6IjY5OTA0MTU6MTA0NjkxMDMiLCJvcHRPdXQiOmZhbHNlLCJzZXNzaW9uSWQiOjE1Njk0NTk5NjI2MDYsImxhc3RFdmVudFRpbWUiOjE1Njk0NTk5NjI2MjAsImV2ZW50SWQiOjEsImlkZW50aWZ5SWQiOjEsInNlcXVlbmNlTnVtYmVyIjoyfQ==; country=cn; _gid=GA1.2.1353345406.1570686670; ajs_user_id=%227185997%3A10862654%22; ajs_anonymous_id=%220897f527-4a92-4b8c-b183-8e1193253050%22; pipedrive-cdl=us-east-1; fs_uid=rs.fullstory.com`1GTF1`4796838011764736:6557220283908096`442337bb`/1600995966; pd_referrer=%5B%7B%22referrer_url%22%3Anull%2C%22landing_url%22%3A%22https%3A%2F%2F20190916-6cdaf0.pipedrive.com%2Fpipeline%3Fhasaccount%3D1%22%2C%22ts%22%3A%222019-09-16%2000%3A23%3A21%22%7D%2C%7B%22referrer_url%22%3Anull%2C%22landing_url%22%3A%22https%3A%2F%2Fwww.pipedrive.com%2F%3Fhasaccount%3D1%22%2C%22ts%22%3A%222019-09-23%2023%3A42%3A44%22%7D%2C%7B%22referrer_url%22%3Anull%2C%22landing_url%22%3A%22https%3A%2F%2Fwww.pipedrive.com%2F%3Fhasaccount%3D1%22%2C%22ts%22%3A%222019-09-25%2023%3A14%3A02%22%7D%2C%7B%22referrer_url%22%3Anull%2C%22landing_url%22%3A%22https%3A%2F%2Fwww.pipedrive.com%2F%3Fhasaccount%3D1%22%2C%22ts%22%3A%222019-10-10%2005%3A51%3A10%22%7D%2C%7B%22referrer_url%22%3Anull%2C%22landing_url%22%3A%22https%3A%2F%2F20191010-1c32d5.pipedrive.com%2Fauth%2Flogin%3Freturn_url%3Dhttps%253A%252F%252F20191010-1c32d5.pipedrive.com%252Fperson%252Fauth%252Flogin%26hasaccount%3D1%22%2C%22ts%22%3A%222019-10-10%2022%3A36%3A34%22%7D%5D; pd_referrer_session=1; pipe-session=nhyUNQK14K83uwVodExhSA6xS7qk1eZw5x0dNboi%2FE3ErrG2fwjwyVWw2nWDxcY5GgY5uoaJ4wCLuSwibrMv3nGlvu1vrjYPTUiNm%2B6PHIjiUDaM1ERCVOnRwosQYwrO%2BY4II2YeVKQWoSXy19zc4PVg1K%2FNAs2wud%2Ft%2B0U5qFFwyvHk2m35hA6ZUpMlKRXU47NNESQFzWqpUifJ6MLnAfXR66joHQ0t; pipe-session-token=203458d1a15a7e2ee237794134057a2d; pd_account=%7B%22hashed_id%22:%2222b15573617159382fc46caf8f80abe5%22,%22hashed_email%22:%221ff43de27970b13359fb52091f6aef18%22,%22is_paying%22:false,%22logged_out%22:false%7D; intercom-session-hqausqan=U3FSZUM5UmNqVVowc29LOUFETEw0anA5RVhqbVNPU0hBYTRTVTdDQm90MXl2RzVpT2tUeHNUV3g0bWxkSWx5Mi0tTGtpMG9uT0pmOHc3ek54MnBqaHdZQT09--624e81ef7faf672e137ababd15664d59813dcf58; RT="sl=0&ss=1570755391407&tt=0&obo=0&sh=&dm=pipedrive.com&si=d06c4e27-a19b-4abd-9e48-73db76edf6fe&ld=1570755392624&nu=https%3A%2F%2F20191010-1c32d5.pipedrive.com%2Fpipeline&cl=1570761678319"; pipe-last-active=1570761683175
js-version: 0729e5c42fbcd942df98
origin: https://20191010-1c32d5.pipedrive.com
referer: https://20191010-1c32d5.pipedrive.com/pipeline
sec-fetch-mode: cors
sec-fetch-site: same-origin
user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36
x-application-context: pipeline
x-requested-with: XMLHttpRequest

{"visible_to":3,"currency":"CNY","person_id":12877,"title":"html5beta.com deal","value":"8888","stage_id":"1","org_id":1}

 */

import {
  host
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import { getSessionToken } from './common'
import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'

async function addOne (i) {
  const token = getSessionToken()
  const url = `${host}/api/v1/deals?session_token=${token}&strict_mode=true`
  const da = {
    visible_to: 3,
    currency: 'CNY',
    person_id: 1,
    title: 'html5beta.com deal' + i,
    value: '8888',
    stage_id: '1',
    org_id: 1
  }
  console.log(i)
  const res = await fetch.post(url, da)
  console.log(res)
}

function wait (ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function addAll (all) {
  for (let i = 0; i < all; i++) {
    await addOne(i)
    wait(500)
  }
}

addAll(200)
