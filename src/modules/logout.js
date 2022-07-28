import { Modal, Button } from 'antd'
import { envs } from 'ringcentral-embeddable-extension-common'

export default function logout () {
  if (document.hidden) {
    function forceReload () {
      window.location.reload()
    }
    Modal.confirm({
      title: `Need reload to continue to use ${envs.name}`,
      content: (
        <div className='pd3 aligncenter'>
          <Button
            type='primary'
            size='large'
            onClick={forceReload}
          >
            Click to reload
          </Button>
        </div>
      ),
      onCancel: forceReload,
      closable: false,
      onOk: forceReload,
      footer: null
    })
  } else {
    window.rc.postMessage({
      type: 'rc-adapter-logout'
    })
  }
}
