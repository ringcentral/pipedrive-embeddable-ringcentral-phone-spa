/**
 * post install script
 */

const replace = require('replace-in-file')

const removeAntdGlobalStyles = () => {
  const options = {
    files: [`${process.cwd()}/node_modules/antd/lib/style/core/index.less`, `${process.cwd()}/node_modules/antd/es/style/core/index.less`],
    from: "@import 'base';",
    to: ''
  }
  const options1 = {
    files: [`${process.cwd()}/node_modules/antd/lib/style/core/index.less`, `${process.cwd()}/node_modules/antd/es/style/core/index.less`],
    from: "@import 'global';",
    to: ''
  }

  replace(options)
    .then(() => {
      return replace(options1)
    })
    .then(() => {
      console.log('[INFO] Successfully Removed Antd Global Styles:')
    })
    .catch(e => {
      console.error('[ERR] Error removing Antd Global Styles:', e)
      process.exit(1)
    })
}

removeAntdGlobalStyles()
