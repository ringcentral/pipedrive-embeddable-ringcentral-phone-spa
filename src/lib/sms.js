/**
 * predefined sms list module
 */

import { useEffect, useState } from 'react'
import { Select, Input, message, Modal } from 'antd'
import { PlusCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import copy from 'json-deep-copy'
import * as ls from 'ringcentral-embeddable-extension-common/src/common/ls'
import './sms.styl'

const { Option } = Select
const key = 'rc-smses'

export default () => {
  const [smses, setSMSes] = useState([])
  const [sms, setSMS] = useState('')
  const [showModal, setShowModal] = useState(false)
  useEffect(() => {
    async function init () {
      const arr = await ls.get(key) || []
      setSMSes(arr)
    }
    init()
    return () => null
  }, [])
  function onSelect (v, opt) {
    window.rc.postMessage({
      type: 'rc-adapter-auto-populate-conversation',
      text: opt.children
    })
  }
  function openModal () {
    setShowModal(true)
  }
  function delSms ({ id }) {
    setSMSes((old) => {
      let smses = copy(old)
      smses = smses.filter(s => {
        return s.id !== id
      })
      return smses
    })
  }
  function submit () {
    if (!sms) {
      return message.warn('required')
    }
    setSMSes(old => {
      const res = [
        ...old, {
          id: Math.random() + '',
          sms
        }
      ]
      ls.set(key, res)
      return res
    })
    setSMS('')
  }
  const editIcon = (
    <PlusCircleOutlined
      onClick={openModal}
    />
  )
  const AddSMS = (
    <div className='rc-pd1y'>
      <div className='rc-sms-form'>
        <Input
          className='rc-sms-input'
          value={sms}
          onChange={e => setSMS(e.target.value)}
        />
        <span
          className='rc-sms-add-btn'
          onClick={submit}
        >
          <PlusCircleOutlined /> Add SMS
        </span>
      </div>
    </div>
  )
  function renderSms (sms) {
    return (
      <div className='rc-pd1b' key={sms.id}>
        {sms.sms || 'no sms'}
        <CloseCircleOutlined
          className='rc-del-sms'
          onClick={() => delSms(sms)}
        />
      </div>
    )
  }
  return (
    <div className='rc-call-note-form rc-sms-wrap'>
      <Select
        searchValue
        onSelect={onSelect}
        suffixIcon={editIcon}
        showSearch
        placeholder='Select SMS'
        style={{ width: '100%' }}
        getPopupContainer={() => document.getElementById('Pipedrive-rc')}
      >
        {
          smses.map(sms => {
            return (
              <Option key={sms.id} value={sms.id}>
                {sms.sms}
              </Option>
            )
          })
        }
      </Select>
      <Modal
        visible={showModal}
        width={500}
        title='Edit SMS'
        footer={null}
        onCancel={() => setShowModal(false)}
        zIndex={10003}
      >
        { AddSMS }
        {
          smses.map(renderSms)
        }
      </Modal>
    </div>
  )
}
