/**
 * react element app
 */

import { useEffect, useState } from 'react'
import { actions, checkCallLogOnStartKey } from '../common/common'
import { useDelta, useConditionalEffect } from 'react-delta'
import eq from 'fast-deep-equal'
import { Modal, Tabs, Switch, Button, message, Typography } from 'antd'
import './antd.less'
import 'antd/dist/antd.less'
import link from '../common/external-link.js'
import { onTriggerLogin } from './handle-login.js'
import { checkSync, startSync } from '../common/sync.js'
import {
  envs,
  ls,
  updateIconState
} from 'ringcentral-embeddable-extension-common'
import {
  LinkOutlined
} from '@ant-design/icons'

const { TabPane } = Tabs
const { Text } = Typography
const loopTimer = 5000

window.rc = {}

export default function Main () {
  const [state, setter] = useState({
    loggedIn: false,
    autoLogSMS: false,
    autoLog: false,
    checkCallLogOnStart: false,
    syncStatus: 'unknown',
    modalVisible: false
  })
  const isSyncing = state.syncStatus === 'syncing'
  const loggedInDelta = useDelta(state.loggedIn)
  const syncStatusDelta = useDelta(state.syncStatus)
  function setState (update) {
    setter(old => {
      return {
        ...old,
        ...update
      }
    })
  }
  function setGlob (ext) {
    Object.assign(window.rc, ext)
    const key = Object.keys(ext)[0]
    ls.set(`rc-${key}`, Object.values(ext)[0])
    setState(ext)
  }
  function hide () {
    setState({
      modalVisible: false
    })
  }
  // function show () {
  //   loadSettings()
  //   setState({
  //     modalVisible: true
  //   })
  // }
  const sets = [
    // {
    //   key: 'logSMSAsThread',
    //   desc: 'Log SMS thread as one log'
    // },
    {
      desc: 'Check call logs not synced to HubSpot on start',
      key: checkCallLogOnStartKey
    }
  ]
  function renderSetting (conf) {
    const { key, desc } = conf
    const v = state[key]
    const pps = {
      checked: v,
      unCheckedChildren: desc,
      checkedChildren: desc,
      onChange: v => {
        setGlob({
          [key]: v
        })
      }
    }
    return (
      <div className='rc-pd1b'>
        <Switch
          {...pps}
        />
      </div>
    )
  }
  function renderSettings () {
    return (
      <TabPane key='settings' tab='Settings'>
        {
          sets.map(renderSetting)
        }
      </TabPane>
    )
  }
  function renderFooter () {
    return (
      <div className='pd3y'>
        <p>
          <a
            className='mg1l'
            href='https://www.ringcentral.com/apps/'
            target='_blank'
            rel='noreferrer'
          >
            <LinkOutlined /> RingCentral App gallery
          </a>
        </p>
        <div className='pd1y'>
          <Text type='secondary'>
            <div>
              <img src='//raw.githubusercontent.com/ringcentral/ringcentral-embeddable/master/src/assets/rc/icon.svg' className='iblock mg1r' alt='' />
              <span className='iblock bold pd1y'>RingCentral Labs</span>
            </div>
            <p>RingCentral Labs is a program that lets RingCentral engineers, platform product managers and other employees share RingCentral apps they've created with the customer community. RingCentral Labs apps are free to use, but are not official products, and should be considered community projects - these apps are not officially tested or documented. For help on any RingCentral Labs app please consult each project's GitHub Issues message boards - RingCentral support is not available for these applications.</p>
          </Text>
        </div>
      </div>
    )
  }
  function openAbout () {
    const content = (
      <Tabs defaultActiveKey='about'>
        <TabPane key='about' tab='About'>
          <div className='rc-pd1b'>
            <b>Version</b>: {envs.appVersion}
          </div>
          <div className='rc-pd1b'>
            <b>HomePage</b>: {link(envs.homePage)}
          </div>
          <div className='rc-pd1b'>
            <b>Download</b>: {link(envs.download)}
          </div>
          <div className='rc-pd1b'>
            <b>Submit issues</b>: {link(envs.issue)}
          </div>
          <div className='rc-pd1b'>
            <b>Video guide</b>: {link(envs.video)}
          </div>
          <div className='rc-pd1y'>
            <Button
              type='primary'
              loading={isSyncing}
              disabled={isSyncing && !state.loggedIn}
              onClick={startSyncNow}
            >
              Rebuild phone contact index
            </Button>
          </div>
          <div className='rc-pd1y'>
            <Button
              type='primary'
              onClick={onTriggerLogin}
            >
              ReConnect your PipeDrive account
            </Button>
          </div>
          {renderFooter()}
        </TabPane>
        {renderSettings()}
      </Tabs>
    )
    const pops = {
      title: 'About ' + envs.name,
      width: 700,
      onCancel: hide,
      footer: null,
      visible: state.modalVisible
    }
    return (
      <Modal
        {...pops}
      >
        {content}
      </Modal>
    )
  }
  async function loadSettings () {
    for (const a of sets) {
      let v = await ls.get(`rc-${a.key}`)
      v = v !== 'no'
      window.rc[a.key] = v
      setState({
        [a.key]: v
      })
    }
  }
  function onEvent (e) {
    if (!e || !e.data) {
      return false
    }
    console.debug(e.data)
    const { action, data } = e.data
    if (action === actions.updateMainAppState) {
      setState(data)
    }
  }
  async function startSyncFunc () {
    const r = await startSync()
    if (!r) {
      message.error('Sync failed')
      setState({
        syncStatus: 'unknown'
      })
    } else if (r !== 'ok' && r) {
      setState({
        syncStatus: 'unknown'
      })
      message.error(r)
    }
  }
  function startSyncNow () {
    setState({
      syncStatus: 'syncing'
    })
    Modal.info({
      title: 'Syncing contacts',
      content: (
        <div className='rc-pd1b'>
          <div className='rc-pd1b'>Server start to sync contacts data, to build the contact lookup mapping(we do not store your contact data in our server), so the extension could match phone number with contact and create proper call/SMS log.</div>
          <div>Before finishing the sync, call/SMS log may not work, reload contact to check, if you see the click to call icon, then this contact is synced.</div>
          <div>When syncing finished, the loading icon on left bottom corner will disappear.</div>
        </div>
      )
    })
    startSyncFunc()
    setTimeout(loopCheckSync, loopTimer)
  }
  async function loopCheckSync () {
    const syncStatus = await checkSync()
    if (!syncStatus) {
      return
    }
    if (syncStatus && syncStatus.percent === 100) {
      setState({
        syncStatus: 'synced'
      })
    } else if (syncStatus && syncStatus.percent === 0) {
      setState({
        syncStatus: 'syncing'
      })
      setTimeout(loopCheckSync, loopTimer)
    } else if (syncStatus === 'no') {
      startSyncNow()
    }
  }
  async function init () {
    const syncStatus = await checkSync()
    if (!syncStatus) {
      return
    }
    if (syncStatus === 'no') {
      startSyncNow()
    } else if (syncStatus && syncStatus.percent === 100) {
      setState({
        syncStatus: 'synced'
      })
    } else if (syncStatus && syncStatus.percent === 0) {
      setState({
        syncStatus: 'syncing'
      })
      setTimeout(loopCheckSync, loopTimer)
    }
  }

  function initIconState () {
    updateIconState({
      showRc: true
    })
  }

  function updateSyncStatus () {
    const v = syncStatusDelta.curr
    const up = {
      loadingTip: '',
      loading: false
    }
    if (v === 'syncing') {
      up.loadingTip = 'Syncing contacts data'
      up.loading = true
    }
    updateIconState(up)
  }

  useEffect(() => {
    window.addEventListener('message', onEvent)
    loadSettings()
    initIconState()
    return () => {
      window.removeEventListener('message', onEvent)
    }
  }, [])

  useConditionalEffect(() => {
    init()
  }, loggedInDelta && loggedInDelta.prev === false && !eq(loggedInDelta.prev, loggedInDelta.curr))
  useConditionalEffect(() => {
    updateSyncStatus()
  }, syncStatusDelta && !eq(loggedInDelta.prev, loggedInDelta.curr))

  return openAbout()
}
