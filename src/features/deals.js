/**
 * deals fetching and caching to indexdb
 */
import { getSessionToken } from './common'
import {
  host // ,
  // createElementFromHTML
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import fetch from 'ringcentral-embeddable-extension-common/src/common/fetch'
// import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import _ from 'lodash'
// import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
// import {
//   connection
// } from 'ringcentral-embeddable-extension-common/src/common/db'
// import * as JsStore from 'jsstore'

// const {
//   appName
// } = thirdPartyConfigs
// // const connection = new JsStore.Connection()
// const dbName = appName.replace(/-/g, '_') + '_deals'
// const tableName = 'Deal'

// function getDbSchema () {
//   /*
// active: true
// activities_count: 0
// add_time: "2019-10-11 03:02:51"
// cc_email: "20191010-1c32d5+deal763@pipedrivemail.com"
// close_time: null
// creator_user_id: 10862654
// currency: "CNY"
// deleted: false
// done_activities_count: 0
// email_messages_count: 0
// expected_close_date: null
// files_count: 0
// first_won_time: null
// followers_count: 1
// formatted_value: "CN¥8,888"
// formatted_weighted_value: "CN¥8,888"
// id: 763
// label: null
// last_activity_date: null
// last_activity_id: null
// last_incoming_mail_time: null
// last_outgoing_mail_time: null
// lost_reason: null
// lost_time: null
// next_activity_date: null
// next_activity_duration: null
// next_activity_id: null
// next_activity_note: null
// next_activity_subject: null
// next_activity_time: null
// next_activity_type: null
// notes_count: 0
// org_hidden: false
// org_id: 1
// org_name: "html5beta.com"
// owner_name: "20191010"
// participants_count: 1
// person_hidden: false
// person_id: 12877
// person_name: "Xudong ZHAO"
// pipeline_id: 1
// probability: null
// products_count: 0
// reference_activities_count: 0
// rotten_time: null
// stage_change_time: null
// stage_id: 1
// stage_order_nr: 1
// status: "open"
// title: "html5beta.com deal760"
// undone_activities_count: 0
// update_time: "2019-10-11 03:02:51"
// user_id: 10862654
// value: 8888
// visible_to: "3"
// weighted_value: 8888
// weighted_value_currency: "CNY"
// won_time: null
//   */
//   const tblContact = {
//     name: tableName,
//     columns: {
//       id: {
//         primaryKey: true,
//         dataType: 'number'
//       },
//       status: {
//         dataType: 'string'
//       },
//       person_id: {
//         dataType: 'number',
//         enableSearch: true
//       },
//       org_id: {
//         dataType: 'number'
//       }
//     }
//   }
//   const db = {
//     name: dbName,
//     tables: [tblContact]
//   }
//   return db
// }

// const databaseConf = getDbSchema()

// function initJsStore () {
//   return connection.initDb(databaseConf)
// }

// async function remove () {
//   await initJsStore()
//   return connection.remove({
//     from: tableName
//   })
// }

export async function searchByPersonId (personId) {
  let token = getSessionToken()
  const res = await getDeals(token, 0, personId)
  if (!res || !res.data) {
    return []
  }
  let final = res.data.map(d => {
    return _.pick(d, [
      'id',
      'status',
      'person_id',
      'org_id'
    ])
  })
  return final
}

// export async function insert (itemOritems) {
//   const items = _.isArray(itemOritems)
//     ? itemOritems
//     : [itemOritems]
//   await initJsStore()
//   return connection.insert({
//     into: tableName,
//     values: items
//   })
// }

function getDeals (token, start, userId = '') {
  let url = `${host}/v1/deals?limit=500&person_id=${userId}&start=${start}&get_summary=0&totals_convert_currency=default_currency&session_token=${token}&strict_mode=true&status=open`
  return fetch.get(url)
}

// export async function getAllDeals () {
//   console.debug('start sync deals')
//   if (window.rc.isFetchingDeals) {
//     return
//   }
//   let token = getSessionToken()
//   window.rc.isFetchingDeals = true
//   loadingDeals()
//   let start = 0
//   let hasMore = true
//   await remove()
//   while (hasMore) {
//     let res = await getDeals(token, start).catch(e => console.log(e.stack))
//     if (!res || !res.data) {
//       window.rc.isFetchingDeals = false
//       return
//     }

//     let final = res.data.map(d => {
//       return _.pick(d, [
//         'id',
//         'status',
//         'person_id',
//         'org_id'
//       ])
//     })
//     start = _.get(res, 'additional_data.pagination.start') + _.get(res, 'additional_data.pagination.limit')
//     hasMore = _.get(res, 'additional_data.pagination.more_items_in_collection')
//     console.debug('fetching deals, start:', start, ', has more:', hasMore)
//     await insert(final).catch(console.debug)
//   }
//   let now = Date.now()
//   window.rc.syncTimestampDeal = now
//   window.rc.isFetchingDeals = false
//   await ls.set('syncTimestampDeal', now)
//   stopLoadingDeals()
// }

// function loadingDeals () {
//   let loadingContactsBtn = document.getElementById('rc-reloading-deals')
//   if (loadingContactsBtn) {
//     return
//   }
//   let elem = createElementFromHTML(
//     `
//     <span
//       class="rc-reloading-deals"
//       id="rc-reloading-deals"
//       title="Resync deals data to RingCentral Widgets"
//     />Syncing deals</span>
//     `
//   )
//   document.body.appendChild(elem)
// }

// function stopLoadingDeals () {
//   let loadingDealsBtn = document.getElementById('rc-reloading-deals')
//   if (loadingDealsBtn) {
//     loadingDealsBtn.remove()
//   }
// }
