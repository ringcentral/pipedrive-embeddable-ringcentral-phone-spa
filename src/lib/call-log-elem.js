/**
 * react element in widget wrapper
 */

import { useState, useEffect } from 'react'
import _ from 'lodash'
import CallLogForm from './call-log-form'
import copy from 'json-deep-copy'
import Drag from 'react-draggable'
import classNames from 'classnames'
import { DownOutlined, UpOutlined } from '@ant-design/icons'

export default function CallLogElem () {
  const [forms, setStateOri] = useState([])
  const [minimized, setMini] = useState(false)

  function show () {
    setMini(false)
  }

  function hide () {
    setMini(true)
  }

  function renderControl () {
    if (minimized) {
      return (
        <UpOutlined
          className='rc-pointer'
          onClick={show}
        />
      )
    }
    return (
      <DownOutlined
        className='rc-pointer'
        onClick={hide}
      />
    )
  }
  function update (id, data) {
    setStateOri(s => {
      const arr = copy(s)
      const ref = _.find(arr, d => d.id + '' === id + '')
      Object.assign(ref, data)
      return arr
    })
  }
  function remove (id) {
    setStateOri(s => {
      return copy(s).filter(d => d.id + '' !== id + '')
    })
  }
  function add (obj) {
    setStateOri(s => {
      if (s.map(d => d.id + '').includes(obj.id + '')) {
        return s
      }
      return [
        ...copy(s),
        obj
      ]
    })
  }
  function onEvent (e) {
    if (!e || !e.data || !e.data.type) {
      return
    }
    const { type, callLogProps } = e.data
    if (type === 'rc-init-call-log-form') {
      add(callLogProps)
    }
  }
  useEffect(() => {
    window.addEventListener('message', onEvent)
    return () => {
      window.removeEventListener('message', onEvent)
    }
  }, [])
  if (!forms.length) {
    return null
  }
  const cls = classNames(
    'rc-log-sync-wrap',
    {
      minimized
    }
  )
  return (
    <Drag>
      <div className={cls}>
        <div className='rc-log-sync-title rc-fix'>
          <span className='rc-fleft'>
            Syncing {forms.length} activities
          </span>
          <span className='rc-fright'>
            {renderControl()}
          </span>
        </div>
        <div className='rc-log-sync-body'>
          {
            forms.map(form => {
              return (
                <CallLogForm
                  form={form}
                  key={form.id}
                  update={update}
                  remove={remove}
                />
              )
            })
          }
        </div>
      </div>
    </Drag>
  )
}
