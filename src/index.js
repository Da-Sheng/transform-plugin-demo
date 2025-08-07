import './styles.css';

// 获取DOM元素
const normalBox = document.querySelector('.normal');
const acceleratedBox = document.querySelector('.accelerated');
const noTransformBox = document.querySelector('.no-transform');
const calcTestBox = document.querySelector('.calc-test');
const prefixTestBox = document.querySelector('.prefix-test');
const complexTestBox = document.querySelector('.complex-test');
const smartWillChangeBox = document.querySelector('.smart-will-change');
const noAnimationBox = document.querySelector('.no-animation');
const edgeCaseBox = document.querySelector('.edge-case');

const animateBtn = document.getElementById('animate');
const toggleBtn = document.getElementById('toggle');
const performanceBtn = document.getElementById('performance');
const fpsElement = document.getElementById('fps');
const fpsMeter = document.getElementById('fps-meter');
const outputElement = document.getElementById('output');
const performanceContainer = document.getElementById('performance-container');

// 动画状态
let isAnimating = false;
let showFps = true;
let isPerformanceTesting = false;
let performanceTestItems = [];

// FPS计算相关变量
let frameCount = 0;
let lastTime = performance.now();
let fps = 0;

// 切换动画
animateBtn.addEventListener('click', () => {
  isAnimating = !isAnimating;
  
  if (isAnimating) {
    normalBox.classList.add('animate-normal');
    acceleratedBox.classList.add('animate-accelerated');
    noTransformBox.classList.add('animate-no-transform');
    calcTestBox.classList.add('animate-calc-test');
    prefixTestBox.classList.add('animate-prefix-test');
    complexTestBox.classList.add('animate-complex-test');
    smartWillChangeBox.classList.add('animate-smart-will-change');
    noAnimationBox.classList.add('animate-no-animation');
    
    animateBtn.textContent = '停止动画';
    
    // 开始FPS计算
    requestAnimationFrame(calculateFps);
  } else {
    normalBox.classList.remove('animate-normal');
    acceleratedBox.classList.remove('animate-accelerated');
    noTransformBox.classList.remove('animate-no-transform');
    calcTestBox.classList.remove('animate-calc-test');
    prefixTestBox.classList.remove('animate-prefix-test');
    complexTestBox.classList.remove('animate-complex-test');
    smartWillChangeBox.classList.remove('animate-smart-will-change');
    noAnimationBox.classList.remove('animate-no-animation');
    
    animateBtn.textContent = '开始动画';
  }
});

// 切换FPS显示
toggleBtn.addEventListener('click', () => {
  showFps = !showFps;
  fpsMeter.style.display = showFps ? 'block' : 'none';
});

// 性能测试
performanceBtn.addEventListener('click', () => {
  if (isPerformanceTesting) {
    stopPerformanceTest();
    performanceBtn.textContent = '开始性能测试';
  } else {
    startPerformanceTest();
    performanceBtn.textContent = '停止性能测试';
  }
});

// 开始性能测试
function startPerformanceTest() {
  isPerformanceTesting = true;
  
  // 清除之前的测试元素
  performanceTestItems.forEach(item => item.remove());
  performanceTestItems = [];
  
  // 创建2D和3D测试元素
  for (let i = 0; i < 100; i++) {
    // 2D元素（蓝色）
    const element2d = document.createElement('div');
    element2d.className = 'performance-test performance-2d';
    element2d.style.backgroundColor = 'rgba(0, 0, 255, 0.5)';
    element2d.dataset.x = Math.random() * (performanceContainer.offsetWidth - 10);
    element2d.dataset.y = Math.random() * (performanceContainer.offsetHeight - 10);
    element2d.dataset.speedX = (Math.random() - 0.5) * 5;
    element2d.dataset.speedY = (Math.random() - 0.5) * 5;
    performanceContainer.appendChild(element2d);
    performanceTestItems.push(element2d);
    
    // 3D元素（红色）
    const element3d = document.createElement('div');
    element3d.className = 'performance-test performance-3d';
    element3d.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    element3d.dataset.x = Math.random() * (performanceContainer.offsetWidth - 10);
    element3d.dataset.y = Math.random() * (performanceContainer.offsetHeight - 10);
    element3d.dataset.speedX = (Math.random() - 0.5) * 5;
    element3d.dataset.speedY = (Math.random() - 0.5) * 5;
    performanceContainer.appendChild(element3d);
    performanceTestItems.push(element3d);
  }
  
  // 开始动画
  requestAnimationFrame(animatePerformanceTest);
}

// 停止性能测试
function stopPerformanceTest() {
  isPerformanceTesting = false;
}

// 性能测试动画
function animatePerformanceTest() {
  if (!isPerformanceTesting) return;
  
  performanceTestItems.forEach(element => {
    // 更新位置
    let x = parseFloat(element.dataset.x);
    let y = parseFloat(element.dataset.y);
    const speedX = parseFloat(element.dataset.speedX);
    const speedY = parseFloat(element.dataset.speedY);
    
    x += speedX;
    y += speedY;
    
    // 边界检查
    if (x < 0 || x > performanceContainer.offsetWidth - 10) {
      element.dataset.speedX = -speedX;
      x = Math.max(0, Math.min(x, performanceContainer.offsetWidth - 10));
    }
    
    if (y < 0 || y > performanceContainer.offsetHeight - 10) {
      element.dataset.speedY = -speedY;
      y = Math.max(0, Math.min(y, performanceContainer.offsetHeight - 10));
    }
    
    // 保存新位置
    element.dataset.x = x;
    element.dataset.y = y;
    
    // 应用变换
    if (element.classList.contains('performance-2d')) {
      element.style.transform = `translateX(${x}px) translateY(${y}px)`;
    } else {
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  });
  
  // 继续动画
  requestAnimationFrame(animatePerformanceTest);
}

// 计算FPS
function calculateFps(now) {
  // 增加帧数
  frameCount++;
  
  // 每秒更新一次FPS
  if (now - lastTime >= 1000) {
    fps = Math.round((frameCount * 1000) / (now - lastTime));
    fpsElement.textContent = fps;
    frameCount = 0;
    lastTime = now;
  }
  
  // 如果动画仍在进行，继续计算FPS
  if (isAnimating || isPerformanceTesting) {
    requestAnimationFrame(calculateFps);
  }
}

// 分析并显示CSS变换前后的对比
function analyzeTransformChanges() {
  const styleSheets = document.styleSheets;
  let originalRules = [];
  let processedRules = [];
  
  // 收集原始CSS规则
  for (let i = 0; i < styleSheets.length; i++) {
    try {
      const rules = styleSheets[i].cssRules || styleSheets[i].rules;
      if (!rules) continue;
      
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j];
        if (rule.style && rule.style.transform) {
          originalRules.push({
            selector: rule.selectorText,
            transform: rule.style.transform
          });
        }
      }
    } catch (e) {
      console.warn('无法访问样式表', e);
    }
  }
  
  // 收集处理后的CSS规则（从实际DOM元素中）
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    const computedStyle = window.getComputedStyle(element);
    const transform = computedStyle.transform;
    
    if (transform && transform !== 'none') {
      const classes = Array.from(element.classList).join('.');
      const id = element.id ? `#${element.id}` : '';
      const tagName = element.tagName.toLowerCase();
      const selector = id || (classes ? `.${classes}` : tagName);
      
      processedRules.push({
        selector,
        transform,
        willChange: computedStyle.willChange,
        transformStyle: computedStyle.transformStyle,
        backfaceVisibility: computedStyle.backfaceVisibility,
        transformOrigin: computedStyle.transformOrigin
      });
    }
  });
  
  // 生成HTML输出
  let html = '<h3>插件处理结果</h3>';
  
  // 原始规则
  html += '<h4>原始CSS规则</h4>';
  html += '<ul>';
  originalRules.forEach(rule => {
    html += `<li><strong>${rule.selector}</strong>: transform: ${rule.transform};</li>`;
  });
  html += '</ul>';
  
  // 处理后的规则
  html += '<h4>处理后的CSS规则</h4>';
  html += '<ul>';
  processedRules.forEach(rule => {
    html += `<li>
      <strong>${rule.selector}</strong>:<br>
      transform: ${rule.transform};<br>
      ${rule.willChange ? `will-change: ${rule.willChange};<br>` : ''}
      ${rule.transformStyle !== 'flat' ? `transform-style: ${rule.transformStyle};<br>` : ''}
      ${rule.backfaceVisibility !== 'visible' ? `backface-visibility: ${rule.backfaceVisibility};<br>` : ''}
      ${rule.transformOrigin !== '50% 50%' ? `transform-origin: ${rule.transformOrigin};<br>` : ''}
    </li>`;
  });
  html += '</ul>';
  
  // 更新输出
  outputElement.innerHTML = html;
}

// 在页面加载完成后，输出一些帮助信息
window.addEventListener('load', () => {
  console.log('页面已加载。点击"开始动画"按钮来测试性能差异。');
  console.log('提示：打开浏览器开发工具的Performance面板，可以更详细地分析性能。');
  
  // 分析CSS变换
  setTimeout(analyzeTransformChanges, 1000);
}); 