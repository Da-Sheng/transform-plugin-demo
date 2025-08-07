const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// 引入我们的 transform 插件
const transformPlugin = require('./postcss-transform-3d-accelerate/lib');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  // 使用我们的 transform 插件（优化版）
                  transformPlugin({
                    // 配置选项
                    addWillChange: true,
                    smartWillChange: true,
                    addPreserve3d: true,
                    addBackfaceVisibility: true,
                    addTransformOrigin: true,
                    processKeyframes: true,
                    enableCache: true,
                    handlePrefixes: true,
                    excludeSelectors: ['.no-transform']
                  })
                ],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
  },
}; 