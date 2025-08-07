/**
 * CSS Transform 3D 加速插件（优化版）
 * 将 CSS 中的 2D 变换转换为 3D 变换，以利用 GPU 硬件加速
 */

'use strict';

// 缓存已处理的值，避免重复计算
const transformCache = new Map();

// 正则表达式，用于匹配各种变换函数
// 优化：使用更精确的正则表达式，并预编译
const TRANSFORM_REGEX = {
  // 匹配 translate(x, y) 或 translate(x)，支持calc()和var()
  translate: /translate\(\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+)(?:\s*,\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+))?\s*\)/g,
  
  // 匹配 translateX(x)
  translateX: /translateX\(\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+)\s*\)/g,
  
  // 匹配 translateY(y)
  translateY: /translateY\(\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+)\s*\)/g,
  
  // 匹配 scale(x, y) 或 scale(x)
  scale: /scale\(\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+)(?:\s*,\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+))?\s*\)/g,
  
  // 匹配 scaleX(x)
  scaleX: /scaleX\(\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+)\s*\)/g,
  
  // 匹配 scaleY(y)
  scaleY: /scaleY\(\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+)\s*\)/g,
  
  // 匹配 rotate(angle)
  rotate: /rotate\(\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+)\s*\)/g,
  
  // 匹配 matrix(a, b, c, d, tx, ty)
  matrix: /matrix\(\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+)\s*,\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+)\s*,\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+)\s*,\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+)\s*,\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+)\s*,\s*((?:[^(),]+|\([^)]*\)|var\([^)]*\))+)\s*\)/g,

  // 匹配浏览器前缀
  prefixes: /^(-webkit-|-moz-|-ms-|-o-)(.+)$/,
  
  // 匹配动画名称
  animation: /^(?:.*?animation(?:-name)?:)(?:[^;]*?)([a-zA-Z0-9_-]+)(?:[^;]*?)(?:;|$)/i
};

/**
 * 将 2D 变换函数转换为 3D 变换函数
 * @param {string} value - CSS 变换值
 * @returns {string} - 转换后的 CSS 变换值
 */
function transform2dTo3d(value) {
  if (!value) return value;
  
  // 检查缓存
  if (transformCache.has(value)) {
    return transformCache.get(value);
  }
  
  try {
    let result = value;

    // 转换 translate(x, y) 为 translate3d(x, y, 0)
    result = result.replace(TRANSFORM_REGEX.translate, (match, x, y = '0') => {
      return `translate3d(${x}, ${y}, 0)`;
    });

    // 转换 translateX(x) 为 translate3d(x, 0, 0)
    result = result.replace(TRANSFORM_REGEX.translateX, (match, x) => {
      return `translate3d(${x}, 0, 0)`;
    });

    // 转换 translateY(y) 为 translate3d(0, y, 0)
    result = result.replace(TRANSFORM_REGEX.translateY, (match, y) => {
      return `translate3d(0, ${y}, 0)`;
    });

    // 转换 scale(x, y) 为 scale3d(x, y, 1)
    result = result.replace(TRANSFORM_REGEX.scale, (match, x, y = x) => {
      return `scale3d(${x}, ${y}, 1)`;
    });

    // 转换 scaleX(x) 为 scale3d(x, 1, 1)
    result = result.replace(TRANSFORM_REGEX.scaleX, (match, x) => {
      return `scale3d(${x}, 1, 1)`;
    });

    // 转换 scaleY(y) 为 scale3d(1, y, 1)
    result = result.replace(TRANSFORM_REGEX.scaleY, (match, y) => {
      return `scale3d(1, ${y}, 1)`;
    });

    // 转换 rotate(angle) 为 rotate3d(0, 0, 1, angle)
    result = result.replace(TRANSFORM_REGEX.rotate, (match, angle) => {
      return `rotate3d(0, 0, 1, ${angle})`;
    });

    // 转换 matrix(a, b, c, d, tx, ty) 为 matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1)
    result = result.replace(TRANSFORM_REGEX.matrix, (match, a, b, c, d, tx, ty) => {
      return `matrix3d(${a}, ${b}, 0, 0, ${c}, ${d}, 0, 0, 0, 0, 1, 0, ${tx}, ${ty}, 0, 1)`;
    });

    // 存入缓存
    transformCache.set(value, result);
    return result;
  } catch (error) {
    // 错误处理：出错时返回原始值
    console.error(`[postcss-transform-3d-accelerate] Error processing value: ${value}`, error);
    return value;
  }
}

/**
 * 检查是否应该排除此选择器
 * @param {string} selector - CSS 选择器
 * @param {Array} excludeSelectors - 要排除的选择器列表
 * @returns {boolean} - 是否应该排除
 */
function shouldExclude(selector, excludeSelectors = []) {
  if (!excludeSelectors.length) return false;
  
  return excludeSelectors.some(exclude => {
    if (exclude instanceof RegExp) {
      return exclude.test(selector);
    }
    return selector.includes(exclude);
  });
}

/**
 * 检查规则是否包含动画或过渡
 * @param {Object} rule - PostCSS 规则对象
 * @returns {boolean} - 是否包含动画或过渡
 */
function hasAnimationOrTransition(rule) {
  return rule.nodes.some(node => {
    if (node.type !== 'decl') return false;
    
    const prop = node.prop.toLowerCase();
    return prop === 'transition' || 
           prop === 'transition-property' || 
           prop === 'animation' || 
           prop === 'animation-name' ||
           prop.startsWith('transition-') || 
           prop.startsWith('animation-');
  });
}

/**
 * 提取规则中使用的动画名称
 * @param {Object} rule - PostCSS 规则对象
 * @returns {Array} - 动画名称数组
 */
function extractAnimationNames(rule) {
  const animationNames = [];
  
  rule.walkDecls(decl => {
    const prop = decl.prop.toLowerCase();
    if (prop === 'animation' || prop === 'animation-name') {
      // 简单解析动画名称（实际情况可能更复杂）
      const names = decl.value.split(/\s+|,/).filter(name => {
        // 过滤掉关键字和时间值
        return !name.match(/^(none|inherit|initial|unset|infinite|alternate|forwards|backwards|both|normal|reverse|alternate-reverse|ease|linear|ease-in|ease-out|ease-in-out|step-start|step-end|paused|running|\d+m?s)$/i) && 
               !name.match(/^\d+(\.\d+)?(m?s|%)$/);
      });
      animationNames.push(...names);
    }
  });
  
  return animationNames;
}

/**
 * 处理浏览器前缀
 * @param {string} prop - CSS 属性
 * @returns {string} - 不带前缀的属性名
 */
function handleVendorPrefix(prop) {
  const match = prop.match(TRANSFORM_REGEX.prefixes);
  return match ? match[2] : prop;
}

/**
 * PostCSS 插件：CSS Transform 3D 加速（优化版）
 */
module.exports = (opts = {}) => {
  const options = {
    // 要排除的选择器列表
    excludeSelectors: [],
    
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
    handlePrefixes: true,
    
    ...opts
  };

  // 如果禁用缓存，清空缓存
  if (!options.enableCache) {
    transformCache.clear();
  }

  return {
    postcssPlugin: 'postcss-transform-3d-accelerate',
    
    Once(root, { result }) {
      try {
        // 收集被排除选择器使用的动画名称
        const excludedAnimations = new Set();
        
        if (options.processKeyframes && options.excludeSelectors.length > 0) {
          root.walkRules(rule => {
            if (shouldExclude(rule.selector, options.excludeSelectors)) {
              // 提取被排除选择器使用的动画名称
              const animationNames = extractAnimationNames(rule);
              animationNames.forEach(name => excludedAnimations.add(name));
            }
          });
        }
        
        // 遍历所有规则
        root.walkRules(rule => {
          // 检查是否应该排除此选择器
          if (shouldExclude(rule.selector, options.excludeSelectors)) {
            return;
          }

          // 检查是否有动画或过渡
          const hasAnimation = options.smartWillChange ? hasAnimationOrTransition(rule) : true;

          // 需要处理的属性列表
          const transformProps = options.handlePrefixes ? 
            ['transform', '-webkit-transform', '-moz-transform', '-ms-transform', '-o-transform'] : 
            ['transform'];

          // 遍历所有声明
          transformProps.forEach(transformProp => {
            rule.walkDecls(transformProp, decl => {
              // 转换 transform 值
              const originalValue = decl.value;
              const newValue = transform2dTo3d(originalValue);
              
              // 如果值发生了变化，则更新声明
              if (newValue !== originalValue) {
                decl.value = newValue;
                
                // 添加 will-change: transform
                if (options.addWillChange && (!options.smartWillChange || hasAnimation)) {
                  const hasWillChange = rule.nodes.some(i => 
                    i.type === 'decl' && 
                    i.prop === 'will-change' && 
                    i.value.includes('transform')
                  );
                  
                  if (!hasWillChange) {
                    rule.append({ prop: 'will-change', value: 'transform' });
                  }
                }
                
                // 添加 transform-style: preserve-3d
                if (options.addPreserve3d) {
                  const hasTransformStyle = rule.nodes.some(i => 
                    i.type === 'decl' && 
                    i.prop === 'transform-style'
                  );
                  
                  if (!hasTransformStyle) {
                    rule.append({ prop: 'transform-style', value: 'preserve-3d' });
                  }
                }
                
                // 添加 backface-visibility: hidden
                if (options.addBackfaceVisibility) {
                  const hasBackfaceVisibility = rule.nodes.some(i => 
                    i.type === 'decl' && 
                    i.prop === 'backface-visibility'
                  );
                  
                  if (!hasBackfaceVisibility) {
                    rule.append({ prop: 'backface-visibility', value: 'hidden' });
                  }
                }
                
                // 添加默认的 transform-origin
                if (options.addTransformOrigin) {
                  const hasTransformOrigin = rule.nodes.some(i => 
                    i.type === 'decl' && 
                    handleVendorPrefix(i.prop) === 'transform-origin'
                  );
                  
                  if (!hasTransformOrigin) {
                    rule.append({ prop: 'transform-origin', value: '50% 50%' });
                  }
                }
              }
            });
          });
        });
        
        // 处理 @keyframes 中的 transform
        if (options.processKeyframes) {
          root.walkAtRules('keyframes', atRule => {
            // 检查是否是被排除的动画
            const animationName = atRule.params;
            if (excludedAnimations.has(animationName)) {
              // 跳过被排除选择器使用的动画
              return;
            }
            
            atRule.walkRules(keyframeRule => {
              // 需要处理的属性列表
              const transformProps = options.handlePrefixes ? 
                ['transform', '-webkit-transform', '-moz-transform', '-ms-transform', '-o-transform'] : 
                ['transform'];
                
              transformProps.forEach(transformProp => {
                keyframeRule.walkDecls(transformProp, decl => {
                  // 转换 transform 值
                  const originalValue = decl.value;
                  const newValue = transform2dTo3d(originalValue);
                  
                  // 如果值发生了变化，则更新声明
                  if (newValue !== originalValue) {
                    decl.value = newValue;
                  }
                });
              });
            });
          });
          
          // 处理 -webkit-keyframes 等前缀版本
          if (options.handlePrefixes) {
            const prefixedKeyframes = ['-webkit-keyframes', '-moz-keyframes', '-ms-keyframes', '-o-keyframes'];
            prefixedKeyframes.forEach(prefixedKeyframe => {
              root.walkAtRules(prefixedKeyframe, atRule => {
                // 检查是否是被排除的动画
                const animationName = atRule.params;
                if (excludedAnimations.has(animationName)) {
                  // 跳过被排除选择器使用的动画
                  return;
                }
                
                atRule.walkRules(keyframeRule => {
                  keyframeRule.walkDecls(/^(-webkit-|-moz-|-ms-|-o-)?transform$/, decl => {
                    // 转换 transform 值
                    const originalValue = decl.value;
                    const newValue = transform2dTo3d(originalValue);
                    
                    // 如果值发生了变化，则更新声明
                    if (newValue !== originalValue) {
                      decl.value = newValue;
                    }
                  });
                });
              });
            });
          }
        }
      } catch (error) {
        // 全局错误处理
        result.warn(`[postcss-transform-3d-accelerate] An error occurred: ${error.message}`);
      }
    }
  };
};

module.exports.postcss = true; 