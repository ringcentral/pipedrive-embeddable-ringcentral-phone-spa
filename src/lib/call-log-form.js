/**
 * form for create contact
 */

import { useEffect, useState, useRef } from 'react'
import { Input, Form, Button, Select, Tooltip, Spin } from 'antd'
import { doSync } from '../features/call-log-sync'
import CountDown from './countdown'
import { searchByPersonId } from '../features/deals'

const FormItem = Form.Item
const { Option } = Select

export default function CallLogForm (props) {
  const countdownRef = useRef()
  const [form] = Form.useForm()
  const [deals, setDeals] = useState([])
  const [loading, setLoad] = useState(false)
  const [showCountdown, setCountDownShow] = useState(true)
  const {
    body,
    isManuallySync,
    relatedContacts,
    info,
    note
  } = props.form
  const isCall = !!body.call
  const timer = 20000
  const cls = 'rc-add-call-log-form'
  function renderList () {
    const txt = relatedContacts.map(c => {
      return `${c.name}(${c.emails[0]})`
    }).join(', ')
    return (
      <div className='rc-pd1b'>
        <Tooltip
          title={txt}
          getPopupContainer={getBox}
        >
          <div className='rc-elli'>{txt}</div>
        </Tooltip>
      </div>
    )
  }
  function renderDetail () {
    return (
      <li>
        {info.detail}
      </li>
    )
  }
  function renderNote () {
    return isCall && props.form.isManuallySync
      ? (
        <FormItem
          name='description'
          label='Note'
        >
          <Input.TextArea rows={row} onClick={removeCountDown} />
        </FormItem>
        )
      : null
  }
  // const cls = 'rc-add-call-log-form'
  function onFinish (data) {
    clearTimeout(countdownRef.current)
    doSync(
      body,
      data || {},
      isManuallySync,
      relatedContacts,
      info
    )
    handleCancel()
  }
  function handleCancel () {
    props.remove(props.form.id)
  }
  function getBox () {
    return document.getElementById('Pipedrive-rc')
  }
  function onTimeout () {
    form.submit()
  }
  async function loadDeals () {
    setLoad(true)
    const deals = await searchByPersonId(relatedContacts[0])
    setDeals(deals)
    setLoad(false)
  }
  useEffect(() => {
    loadDeals()
    if (!isManuallySync) {
      countdownRef.current = setTimeout(onTimeout, timer)
    }
    return () => {
      clearTimeout(countdownRef.current)
    }
  }, [])
  function renderCountDown () {
    if (!showCountdown || props.form.isManuallySync) {
      return null
    }
    return (
      <span>(<CountDown time={25} />)</span>
    )
  }
  function renderTime () {
    return (
      <li>
        time: <b>{info.time}</b>
      </li>
    )
  }
  function removeCountDown () {
    setCountDownShow(false)
  }
  const name = isCall ? 'call' : 'message'
  const row = 2
  return (
    <div className={cls}>
      <Spin spinning={loading}>
        <div className='rc-pd2'>
          <Form
            layout='vertical'
            form={form}
            name='rc-add-call-log-form'
            onFinish={onFinish}
            initialValues={{
              description: note
            }}
          >
            <h3 className='rc-sync-title rc-pd1b'>
              Sync {name} log to matched contacts:
            </h3>
            {
              renderList()
            }
            <ul className='rc-pd1b rc-wordbreak'>
              {renderDetail()}
              {renderTime()}
            </ul>
            {renderNote()}
            <FormItem
              name='deal'
              label='Sync to deal'
            >
              <Select
                getPopupContainer={getBox}
                placeholder='Select deal'
                onClick={removeCountDown}
                defaultOpen
                defaultValue={deals ?? deals[0].id}
              >
                {
                  deals.map(obj => {
                    return (
                      <Option value={obj.id} key={obj.id}>
                        {obj.title}
                      </Option>
                    )
                  })
                }
              </Select>
            </FormItem>
            <Button
              type='primary'
              htmlType='submit'
            >
              Submit {renderCountDown()}
            </Button>
            <Button onClick={handleCancel} className='rc-mg1l'>
              Cancel
            </Button>
          </Form>
        </div>
      </Spin>
    </div>
  )
}
