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

export default (props) => {
  const [smses, setSMSes] = useState([])
  const [sms, setSMS] = useState('')
  const [smsTitle, setSMSTitle] = useState('')
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
    const { key } = opt
    const obj = smses.find(s => s.id === key)
    if (props.path.startsWith('/composeText')) {
      window.rc.postMessage({
        type: 'rc-adapter-new-sms',
        phoneNumber: '',
        text: obj.sms
      })
    } else {
      window.rc.postMessage({
        type: 'rc-adapter-auto-populate-conversation',
        text: obj.sms
      })
    }
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
      return message.warn('sms required')
    }
    setSMSes(old => {
      const res = [
        ...old, {
          id: Math.random() + '',
          sms,
          smsTitle
        }
      ]
      ls.set(key, res)
      return res
    })
    setSMS('')
    setSMSTitle('')
  }
  const editIcon = (
    <PlusCircleOutlined
      onClick={openModal}
    />
  )
  const AddSMS = (
    <div className='rc-pd1y rc-mg2b'>
      <div className='rc-sms-form'>
        <div className='rc-sms-form'>
          <Input
            className='rc-sms-input'
            value={smsTitle}
            placeholder='SMS title'
            onChange={e => setSMSTitle(e.target.value)}
          />
        </div>
        <div className='rc-sms-form'>
          <Input.TextArea
            className='rc-sms-input'
            value={sms}
            rows={1}
            placeholder='SMS'
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
    </div>
  )
  function renderSms (sms) {
    return (
      <div className='rc-pd1b' key={sms.id}>
        <p className='rc-fix'>
          <b>{sms.smsTitle}</b>
          <CloseCircleOutlined
            className='rc-del-sms'
            onClick={() => delSms(sms)}
          />
        </p>
        <p>{sms.sms}</p>
      </div>
    )
  }
  return (
    <div className='rc-call-note-form rc-sms-wrap'>
      <Select
        onSelect={onSelect}
        suffixIcon={editIcon}
        showSearch
        placeholder='Select SMS'
        className='rc-sms-select'
        getPopupContainer={() => document.getElementById('Pipedrive-rc')}
      >
        {
          smses.map(sms => {
            return (
              <Option key={sms.id} value={sms.id}>
                {sms.smsTitle || sms.sms}
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
        {AddSMS}
        {
          smses.map(renderSms)
        }
      </Modal>
    </div>
  )
}
