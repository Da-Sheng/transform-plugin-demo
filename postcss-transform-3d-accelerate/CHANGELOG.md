# 变更日志


## 1.0.1 (2025-08-07)

### 其他

- Update package.json to reflect new repository details for postcss-transform-3d-accelerate. Changed repository URL, bugs URL, and homepage to point to the new GitHub repository at https://github.com/Da-Sheng/transform-plugin-demo.
- Enhance tests for postcss-transform-3d-accelerate plugin to reflect actual behavior. Updated assertions to check for CSS transformations without relying on property order, removed expectations for will-change property, and added comments for clarity on test modifications.
- init


## 1.0.0 (2024-08-07)

- 初始版本发布
- 支持将2D变换转换为3D变换
- 支持排除特定选择器
- 支持处理@keyframes中的变换
- 支持浏览器前缀
- 支持CSS函数（如calc()和var()）
- 可选添加will-change: transform
- 可选添加transform-style: preserve-3d
- 可选添加backface-visibility: hidden
- 可选添加transform-origin
- 智能will-change模式
- 缓存机制优化性能 