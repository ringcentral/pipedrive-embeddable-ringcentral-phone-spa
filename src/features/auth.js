/**
 * auth related feature
 */

import {
  sendMsgToRCIframe
} from 'ringcentral-embeddable-extension-common/src/common/helpers'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'

let tokenHandler

window.rc = {
  postMessage: sendMsgToRCIframe
}

export async function updateUserAuthed (authed) {
  if (!authed) {
    await ls.remove('userAuthed')
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
  const dom = document.querySelector('.rc-auth-button-wrap')
  dom && dom.classList.add('rc-hide-to-side')
}

/**
 * when user click contacts in ringcentral widgets or
 * try to get third party contacts,
 * need show auth button to user
 */
export function showAuthBtn () {
  window.postMessage({
    type: 'rc-show-auth-panel'
  }, '*')
}

/**
 * hide auth panel when auth end
 */
export function hideAuthPanel () {
  const frameWrap = document.getElementById('rc-auth-hs')
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
  const refreshContactsBtn = document.getElementById('rc-reload-contacts')
  if (refreshContactsBtn) {
    refreshContactsBtn.remove()
  }
}
