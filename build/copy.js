const CopyWebpackPlugin = require('copy-webpack-plugin')
const { resolve } = require('path')

const cwd = process.cwd()
const from = resolve(
  cwd,
  'node_modules/ringcentral-embeddable-extension-common/src/icons'
)
const to1 = resolve(
  cwd,
  'dist/icons'
)
// const f2 = resolve(
//   cwd,
//   'node_modules/jsstore/dist/jsstore.min.js'
// )
const f31 = resolve(
  cwd,
  'node_modules/react/umd/react.production.min.js'
)
const f32 = resolve(
  cwd,
  'node_modules/react-dom/umd/react-dom.production.min.js'
)
const to4 = resolve(
  cwd,
  'dist'
)
const patterns = [{
  from,
  to: to1,
  force: true
}, /* {
  from: f2,
  to: to4,
  force: true
}, {
  from: f3,
  to: to4,
  force: true
},  {
  from: f2,
  to: to4f,
  force: true
}, */
{
  from: f31,
  to: to4,
  force: true
},
{
  from: f32,
  to: to4,
  force: true
}]
const copy = new CopyWebpackPlugin({
  patterns
})

exports.copy = copy
