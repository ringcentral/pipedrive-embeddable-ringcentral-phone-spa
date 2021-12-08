/**
 * add contacts
 */

/**
 * https://20191010-1c32d5.pipedrive.com/api/v1/persons?session_token=239bef29ea7e0ebf9efdb85b8c2a3316&strict_mode=true

:authority: 20191010-1c32d5.pipedrive.com
:method: POST
:path: /api/v1/persons?session_token=239bef29ea7e0ebf9efdb85b8c2a3316&strict_mode=true
:scheme: https
accept: application/json, text/javascript, ; q=0.01
accept-encoding: gzip, deflate, br
accept-language: en,zh-CN;q=0.9,zh;q=0.8
content-length: 182
content-type: application/json
cookie: pd_language_selection=en; ajs_group_id=null; _ga=GA1.2.173106858.1559715460; device_id=LVKIHY_AGoowGEHmqs_OzCy9; has_account=1; _fbp=fb.1.1559715985195.555704607; split_tests=%7B%22190819uxmission%22%3A%22b%22%2C%222ndcta290419%22%3A%22b%22%7D; _gcl_au=1.1.1200628266.1567722564; optimizelyEndUserId=oeu1568593205461r0.508154798716431; pd_cookie-policy-agreement=1; _hjid=77a92b93-c103-4e1c-8cdb-f1a07f4559cc; amplitude_idundefinedpipedrive.com=eyJvcHRPdXQiOmZhbHNlLCJzZXNzaW9uSWQiOm51bGwsImxhc3RFdmVudFRpbWUiOm51bGwsImV2ZW50SWQiOjAsImlkZW50aWZ5SWQiOjAsInNlcXVlbmNlTnVtYmVyIjowfQ==; amplitude_id_ef651cb38f5e1e69be707ede7f95fdc0pipedrive.com=eyJkZXZpY2VJZCI6ImY1ZjgyNmM2LWZjODktNGU0Yi1iZDRhLTQ4Zjk1ZGFmMTFiOCIsInVzZXJJZCI6IjY5OTA0MTU6MTA0NjkxMDMiLCJvcHRPdXQiOmZhbHNlLCJzZXNzaW9uSWQiOjE1Njk0NTk5NjI2MDYsImxhc3RFdmVudFRpbWUiOjE1Njk0NTk5NjI2MjAsImV2ZW50SWQiOjEsImlkZW50aWZ5SWQiOjEsInNlcXVlbmNlTnVtYmVyIjoyfQ==; country=cn; _gid=GA1.2.1353345406.1570686670; pd_referrer=%5B%7B%22referrer_url%22%3Anull%2C%22landing_url%22%3A%22https%3A%2F%2F20190916-6cdaf0.pipedrive.com%2Fpipeline%3Fhasaccount%3D1%22%2C%22ts%22%3A%222019-09-16%2000%3A23%3A21%22%7D%2C%7B%22referrer_url%22%3Anull%2C%22landing_url%22%3A%22https%3A%2F%2Fwww.pipedrive.com%2F%3Fhasaccount%3D1%22%2C%22ts%22%3A%222019-09-23%2023%3A42%3A44%22%7D%2C%7B%22referrer_url%22%3Anull%2C%22landing_url%22%3A%22https%3A%2F%2Fwww.pipedrive.com%2F%3Fhasaccount%3D1%22%2C%22ts%22%3A%222019-09-25%2023%3A14%3A02%22%7D%2C%7B%22referrer_url%22%3Anull%2C%22landing_url%22%3A%22https%3A%2F%2Fwww.pipedrive.com%2F%3Fhasaccount%3D1%22%2C%22ts%22%3A%222019-10-10%2005%3A51%3A10%22%7D%5D; pd_referrer_session=1; pipe-session=F%2BlQ89EniZmeR6XLFvb7JnHdcoTZjrRQU%2FJu81ayWoFOQdumbF8jXP5nePx%2BQNiTlW%2F2pBzyfRjdJ6%2BDnSvjEqIy3neW6I5dZZK4JgJL3qTAHZdnNCDcxXFvgptsF6WY65d59nbxCcMmi8IaEL9YCfKjK%2BMwF7%2B%2FPnWcqFZM3ryszxyb7A5yw9BCxXWRDVqHncC5Q87ahHpJonwLY0SAqFV8ZwonlYTH; pipe-session-token=239bef29ea7e0ebf9efdb85b8c2a3316; pd_account=%257B%2522hashed_id%2522%3A%252222b15573617159382fc46caf8f80abe5%2522%2C%2522hashed_email%2522%3A%25221ff43de27970b13359fb52091f6aef18%2522%2C%2522is_paying%2522%3Afalse%2C%2522logged_out%2522%3Afalse%257D; ajs_user_id=%227185997%3A10862654%22; ajs_anonymous_id=%220897f527-4a92-4b8c-b183-8e1193253050%22; pipedrive-cdl=us-east-1; fs_uid=rs.fullstory.com`1GTF1`4796838011764736:5443182372093952`442337bb`/1600995966; intercom-session-hqausqan=RFUxYzEyNWRwUjNCWUF6WGZhbnYwcjlyQ3J0OFIzTnJJbEFVaFU5VVhqMTBrTyswZVpub0JHSHQzRThkZkMycy0tamNQN01Majh5cW91bzlxT1JRMXBzZz09--84bd6112283fd5fc95e9187ef8f04f215fe87ed0; RT="sl=13&ss=1570686663911&tt=116501&obo=0&sh=1570691074739%3D13%3A0%3A116501%2C1570691029564%3D12%3A0%3A115442%2C1570690969364%3D11%3A0%3A113584%2C1570690119668%3D10%3A0%3A111579%2C1570689800626%3D9%3A0%3A108263&dm=pipedrive.com&si=d06c4e27-a19b-4abd-9e48-73db76edf6fe&bcn=%2F%2F173c5b0a.akstat.io%2F&rl=1&ld=1570691074740&r=https%3A%2F%2F20191010-1c32d5.pipedrive.com%2Fperson%2F1&ul=1570691089300&hd=1570691089304"; pipe-last-active=1570691282625
js-version: 464ca15108dd069f4e5d
origin: https://20191010-1c32d5.pipedrive.com
referer: https://20191010-1c32d5.pipedrive.com/persons/list/user/10862654
sec-fetch-mode: cors
sec-fetch-site: same-origin
user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36
x-application-context: person_list
x-requested-with: XMLHttpRequest

{"name":"test1","email":[{"label":"work","value":"test1@tt.tt","primary":true}],"phone":[{"label":"work","value":"(650) 437-7931","primary":true}],"visible_to":3,"owner_id":10862654}
 */

import {
  host
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import { getSessionToken } from './common'
import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'

export async function addContact ({
  name, email, phone
}) {
  const token = getSessionToken()
  const url = `${host}/api/v1/persons?session_token=${token}&strict_mode=true`
  const da = {
    name,
    email: [
      {
        label: 'work',
        value: email,
        primary: true
      }
    ],
    phone: [
      {
        label: 'work',
        value: phone,
        primary: true
      }
    ],
    visible_to: 3
  }
  return fetch.post(url, da)
}

// function wait (ms) {
//   return new Promise((resolve) => {
//     setTimeout(resolve, ms)
//   })
// }

export async function addAll (all) {
  for (let i = 0; i < all; i++) {
    console.log(i)
    const contact = {
      name: 'test' + i,
      email: `test${i}@tt.tt`,
      phone: `+${16504370000 + i}`
    }
    const res = await addContact(contact)
    console.log(res)
    // wait(500)
  }
}

// addAll(400)
