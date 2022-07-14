module.exports = {
  presets: [
    '@babel/preset-react'
  ],
  plugins: [
    'babel-plugin-lodash',
    [
      'import',
      {
        libraryName: 'antd',
        style: true
      }
    ]
  ]
}
