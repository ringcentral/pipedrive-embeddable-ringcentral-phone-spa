/**
 * auth related feature
 */

import { thirdPartyConfigs } from 'ringcentral-embeddable-extension-common/src/common/app-config'
import logo from 'ringcentral-embeddable-extension-common/src/common/rc-logo'
import {
  createElementFromHTML,
  findParentBySel,
  sendMsgToRCIframe
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'

let tokenHandler
let {
  serviceName
} = thirdPartyConfigs

window.rc = {
  postMessage: sendMsgToRCIframe
}

export async function updateUserAuthed (authed) {
  if (!authed) {
    await ls.clear()
    window.rc.userAuthed = false
  } else {
    window.rc.userAuthed = true
    await ls.set('userAuthed', 'true')
  }
}

/**
 * when user click close auth button or
 * user start auth process, hide auth button
 */
export function hideAuthBtn () {
  let dom = document.querySelector('.rc-auth-button-wrap')
  dom && dom.classList.add('rc-hide-to-side')
}

/**
 * when user click contacts in ringcentral widgets or
 * try to get third party contacts,
 * need show auth button to user
 */
export function showAuthBtn () {
  let dom = document.querySelector('.rc-auth-button-wrap')
  dom && dom.classList.remove('rc-hide-to-side')
}

/**
 * hanle user click auth button
 * @param {*} e
 */
function handleAuthClick (e) {
  let { target } = e
  let { classList } = target
  if (findParentBySel(target, '.rc-auth-btn')) {
    doAuth()
  } else if (classList.contains('rc-dismiss-auth')) {
    hideAuthBtn()
  }
}

/**
 * hide auth panel when auth end
 */
export function hideAuthPanel () {
  let frameWrap = document.getElementById('rc-auth-hs')
  frameWrap && frameWrap.classList.add('rc-hide-to-side')
}

/**
 * todo
 * do the auth here,
 * might need get apikey or maybe just do nothing
 */
export async function doAuth () {
  if (window.rc.userAuthed) {
    return
  }
  hideAuthBtn()
  let frameWrap = document.getElementById('rc-auth-hs')
  frameWrap && frameWrap.classList.remove('rc-hide-to-side')
  updateUserAuthed(true)
  notifyRCAuthed()
}

/**
 * notify ringcentral widgets about auth status
 * @param {} authorized
 */
export function notifyRCAuthed (authorized = true) {
  window.rc.postMessage({
    type: 'rc-adapter-update-authorization-status',
    authorized
  })
}

/**
 * when user click unauth button from ringcentral widgets
 */
export async function unAuth () {
  await updateUserAuthed(false)
  clearTimeout(tokenHandler)
  notifyRCAuthed(false)
  let refreshContactsBtn = document.getElementById('rc-reload-contacts')
  if (refreshContactsBtn) {
    refreshContactsBtn.remove()
  }
}

/**
 * render auth button
 * todo: you can customize this
 */
export function renderAuthButton () {
  let btn = createElementFromHTML(
    `
      <div class="rc-auth-button-wrap animate rc-hide-to-side">
        <span class="rc-auth-btn">
          <span class="rc-iblock">Auth</span>
          <img class="rc-iblock" src="${logo}" />
          <span class="rc-iblock">access ${serviceName} data</span>
        </span>
        <div class="rc-auth-desc rc-pd1t">
          After auth, you can access ${serviceName} contacts from RingCentral phone's contacts list. You can revoke access from RingCentral phone's setting.
        </div>
        <div class="rc-pd1t">
          <span class="rc-dismiss-auth" title="dismiss">&times;</span>
        </div>
      </div>
    `
  )
  btn.onclick = handleAuthClick
  if (
    !document.querySelector('.rc-auth-button-wrap')
  ) {
    document.body.appendChild(btn)
  }
}

/**
 * todo: you can customize this
 */
export function renderAuthPanel () {
  return false
}
