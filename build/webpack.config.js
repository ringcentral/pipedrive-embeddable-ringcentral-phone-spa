const {
  env,
  minimize,
  envs
} = require('./common.js')
const AntdDayjsWebpackPlugin = require('@electerm/antd-dayjs-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const _ = require('lodash')
const path = require('path')
const {
  stylusSettingPlugin
} = require('./plugins.js')
const rules = require('./rules.js')
const webpack = require('webpack')
const { copy } = require('./copy.js')

const cwd = process.cwd()
const config = {
  mode: 'production',
  entry: {
    content: './src/content.js',
    manifest: './src/manifest.json'
  },
  output: {
    path: path.resolve(cwd, 'dist'),
    filename: '[name].js',
    publicPath: '/',
    chunkFilename: '[name].[hash].js',
    libraryTarget: 'var',
    library: 'RcForPipeDriveChromeExt'
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  },
  target: 'web',
  resolve: {
    fullySpecified: false,
    extensions: ['.js', '.json'],
    alias: {
      'antd/dist/antd.less$': path.resolve(cwd, 'src/lib/antd.less')
    }
  },
  resolveLoader: {
    modules: [
      path.join(cwd, 'node_modules/ringcentral-embeddable-extension-common/loaders'),
      path.join(cwd, 'node_modules')
    ]
  },
  module: {
    rules
  },
  devtool: 'source-map',
  optimization: {
    minimize
  },
  plugins: [
    stylusSettingPlugin,
    new LodashModuleReplacementPlugin({
      collections: true,
      paths: true
    }),
    copy,
    new AntdDayjsWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.envs': JSON.stringify(envs)
    })
  ].filter(_.identity)
}

module.exports = config
