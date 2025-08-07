# PostCSS Transform 3D Accelerate

[PostCSS] 插件，自动将 CSS 中的 2D 变换转换为 3D 变换，以利用 GPU 硬件加速提高性能。

[PostCSS]: https://github.com/postcss/postcss

```css
/* 输入 */
.box {
  transform: translateX(10px) scale(1.2) rotate(45deg);
}

/* 输出 */
.box {
  transform: translate3d(10px, 0, 0) scale3d(1.2, 1.2, 1) rotate3d(0, 0, 1, 45deg);
  will-change: transform;
}
```

## 功能特点

- 自动将 `translate()` 转换为 `translate3d()`
- 自动将 `translateX()` 转换为 `translate3d()`
- 自动将 `translateY()` 转换为 `translate3d()`
- 自动将 `scale()` 转换为 `scale3d()`
- 自动将 `scaleX()` 转换为 `scale3d()`
- 自动将 `scaleY()` 转换为 `scale3d()`
- 自动将 `rotate()` 转换为 `rotate3d()`
- 自动将 `matrix()` 转换为 `matrix3d()`
- 可选添加 `will-change: transform`
- 可选添加 `transform-style: preserve-3d`
- 可选添加 `backface-visibility: hidden`
- 支持排除特定选择器
- 支持处理 `@keyframes` 中的变换
- 支持浏览器前缀
- 支持 CSS 函数 (如 `calc()` 和 `var()`)

## 安装

```bash
npm install --save-dev postcss postcss-transform-3d-accelerate
```

## 使用

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-transform-3d-accelerate')({
      // 选项
    })
  ]
}
```

### Webpack 配置

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('postcss-transform-3d-accelerate')({
                    // 选项
                  })
                ]
              }
            }
          }
        ]
      }
    ]
  }
}
```

### Gulp 配置

```js
const postcss = require('gulp-postcss');
const transform3d = require('postcss-transform-3d-accelerate');

gulp.task('css', () => {
  const plugins = [
    transform3d({
      // 选项
    })
  ];
  
  return gulp.src('./src/*.css')
    .pipe(postcss(plugins))
    .pipe(gulp.dest('./dist'));
});
```

## 选项

```js
require('postcss-transform-3d-accelerate')({
  // 要排除的选择器列表
  excludeSelectors: ['.no-transform'],
  
  // 是否添加 will-change: transform
  addWillChange: true,
  
  // 是否只在有动画或过渡时添加 will-change
  smartWillChange: true,
  
  // 是否添加 transform-style: preserve-3d
  addPreserve3d: false,
  
  // 是否添加 backface-visibility: hidden
  addBackfaceVisibility: false,
  
  // 是否添加默认的 transform-origin
  addTransformOrigin: false,
  
  // 是否处理 @keyframes 中的变换
  processKeyframes: true,
  
  // 是否启用缓存
  enableCache: true,
  
  // 是否处理带前缀的变换属性
  handlePrefixes: true
})
```

### excludeSelectors

类型：`Array<String|RegExp>`  
默认值：`[]`

排除特定选择器，使其不受转换影响。排除功能包括：

1. **选择器本身的排除**：被排除选择器中的2D变换不会被转换为3D变换
2. **关联动画的排除**：被排除选择器使用的@keyframes动画也不会被转换
3. **前缀版本的排除**：同时支持排除带浏览器前缀的选择器和动画

```js
excludeSelectors: [
  '.no-transform',          // 排除特定类
  '#specific-element',      // 排除特定ID
  /\.no-.*$/                // 使用正则表达式排除多个选择器
]
```

### addWillChange

类型：`Boolean`  
默认值：`true`

是否添加 `will-change: transform` 属性，以进一步优化性能。

### smartWillChange

类型：`Boolean`  
默认值：`true`

是否只在有动画或过渡时添加 `will-change: transform`。启用此选项可以避免过度使用 `will-change`。

### addPreserve3d

类型：`Boolean`  
默认值：`false`

是否添加 `transform-style: preserve-3d` 属性。

### addBackfaceVisibility

类型：`Boolean`  
默认值：`false`

是否添加 `backface-visibility: hidden` 属性。

### addTransformOrigin

类型：`Boolean`  
默认值：`false`

是否添加默认的 `transform-origin: 50% 50%` 属性。

### processKeyframes

类型：`Boolean`  
默认值：`true`

是否处理 `@keyframes` 中的变换。

### enableCache

类型：`Boolean`  
默认值：`true`

是否启用缓存以提高性能。

### handlePrefixes

类型：`Boolean`  
默认值：`true`

是否处理带浏览器前缀的变换属性 (`-webkit-transform`, `-moz-transform` 等)。

## 兼容性

- Node.js: >= 12.0.0
- PostCSS: >= 8.0.0

## 许可证

MIT

## 贡献

欢迎贡献代码和提出问题！请在 GitHub 上提交 issue 或 pull request。 