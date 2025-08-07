# Transform Plugin Demo

这是一个演示项目，用于展示 `postcss-transform-3d-accelerate` 插件的功能和效果。该插件可以自动将CSS中的2D变换转换为3D变换，以利用GPU硬件加速提高性能。

## 功能特点

### 基本功能
- 自动将 `translate()` 转换为 `translate3d()`
- 自动将 `scale()` 转换为 `scale3d()`
- 自动将 `rotate()` 转换为 `rotate3d()`
- 自动将 `matrix()` 转换为 `matrix3d()`
- 可选添加 `will-change: transform`
- 可选添加 `transform-style: preserve-3d`
- 可选添加 `backface-visibility: hidden`
- 支持排除特定选择器

### 优化版本新增功能
- **性能优化**
  - 使用 Map 缓存已处理的值，避免重复计算
  - 优化正则表达式，支持 calc() 和 var() 等 CSS 函数
  - 减少不必要的字符串操作
  
- **兼容性增强**
  - 支持浏览器前缀 (-webkit-transform, -moz-transform 等)
  - 正确处理 calc() 和 var() 等 CSS 函数
  - 可选添加默认 transform-origin
  
- **功能扩展**
  - 智能 will-change: 仅在有动画或过渡时添加
  - 支持处理 @keyframes 中的变换
  - 更细粒度的控制选项
  - **完善的选择器排除功能**：不仅排除选择器本身，还排除其使用的@keyframes动画
  
- **代码健壮性**
  - 完善的错误处理机制
  - 边界情况处理

## 安装与运行

1. 安装依赖：

```bash
npm install
```

2. 启动开发服务器：

```bash
npm start
```

3. 构建生产版本：

```bash
npm run build
```

## 演示说明

这个演示页面包含多个测试区域：

### 基本测试
- **普通2D变换**：使用2D变换，会被插件转换为3D变换
- **3D加速变换**：已经使用3D变换，不会被修改
- **排除的选择器**：使用2D变换，但由于选择器被排除，不会被转换（包括其使用的动画）

### 功能增强测试
- **CSS函数支持**：测试 calc() 和 var() 等函数的支持
- **浏览器前缀支持**：测试带前缀的变换属性处理
- **复合变换**：测试复杂的复合变换处理

### 智能will-change测试
- **有过渡效果**：有过渡的元素应添加 will-change
- **无动画效果**：无动画的元素不应添加 will-change
- **边界情况测试**：测试带注释的变换等边界情况

### 性能测试
- 对比2D变换和3D变换的性能差异
- 动态创建大量元素进行移动测试

点击"开始动画"按钮可以启动动画，观察性能差异。页面右上角显示当前FPS。

## 如何验证插件效果

1. 运行项目后，打开浏览器开发工具
2. 查看生成的CSS，可以看到2D变换已被转换为3D变换
3. 对比不同元素的动画性能
4. 使用浏览器的Performance面板进行更详细的性能分析
5. 查看页面底部的"插件处理结果"区域，查看变换前后的对比

## 排除选择器功能说明

插件支持排除特定选择器，使其不受转换影响。排除功能包括：

1. **选择器本身的排除**：被排除选择器中的2D变换不会被转换为3D变换
2. **关联动画的排除**：被排除选择器使用的@keyframes动画也不会被转换
3. **前缀版本的排除**：同时支持排除带浏览器前缀的选择器和动画

### 排除选择器的配置方式

```javascript
transformPlugin({
  // 其他配置...
  excludeSelectors: [
    '.no-transform',          // 排除特定类
    '#specific-element',      // 排除特定ID
    /\.no-.*$/                // 使用正则表达式排除多个选择器
  ]
})
```

## 插件配置选项

```javascript
transformPlugin({
  // 基本选项
  addWillChange: true,                // 是否添加 will-change: transform
  addPreserve3d: true,                // 是否添加 transform-style: preserve-3d
  addBackfaceVisibility: true,        // 是否添加 backface-visibility: hidden
  excludeSelectors: ['.no-transform'], // 要排除的选择器列表
  
  // 优化版新增选项
  smartWillChange: true,              // 是否只在有动画或过渡时添加 will-change
  addTransformOrigin: true,           // 是否添加默认的 transform-origin
  processKeyframes: true,             // 是否处理 @keyframes 中的变换
  enableCache: true,                  // 是否启用缓存
  handlePrefixes: true                // 是否处理带前缀的变换属性
})
```

## 优化效果对比

| 功能 | 原始版本 | 优化版本 |
|------|---------|---------|
| 性能缓存 | ❌ | ✅ |
| CSS函数支持 | ❌ | ✅ |
| 浏览器前缀支持 | ❌ | ✅ |
| 智能will-change | ❌ | ✅ |
| transform-origin支持 | ❌ | ✅ |
| 错误处理 | ❌ | ✅ |
| 边界情况处理 | ❌ | ✅ |
| 完整的选择器排除 | ❌ | ✅ | 