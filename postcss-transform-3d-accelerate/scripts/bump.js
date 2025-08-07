#!/usr/bin/env node

/**
 * 交互式版本号自增脚本
 * 
 * 此脚本提供交互式界面，让用户选择要自增的版本类型（patch/minor/major）
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 获取当前版本号
const currentVersion = require('../package.json').version;

console.log(`当前版本: ${currentVersion}`);
console.log('请选择要自增的版本类型:');
console.log('1) patch - 修订版本 (1.0.0 -> 1.0.1)');
console.log('2) minor - 次要版本 (1.0.0 -> 1.1.0)');
console.log('3) major - 主要版本 (1.0.0 -> 2.0.0)');
console.log('4) 自定义版本号');

rl.question('请输入选项 (1-4): ', (answer) => {
  try {
    switch (answer.trim()) {
      case '1':
        execSync('npm run bump:patch', { stdio: 'inherit' });
        break;
      case '2':
        execSync('npm run bump:minor', { stdio: 'inherit' });
        break;
      case '3':
        execSync('npm run bump:major', { stdio: 'inherit' });
        break;
      case '4':
        rl.question('请输入自定义版本号 (例如 1.2.3): ', (version) => {
          try {
            execSync(`npm version ${version} -m "chore(release): %s"`, { stdio: 'inherit' });
            execSync('npm run update-changelog', { stdio: 'inherit' });
            rl.close();
          } catch (error) {
            console.error('自定义版本号设置失败:', error.message);
            rl.close();
          }
        });
        return; // 不要关闭rl，等待第二个问题
      default:
        console.error('无效的选项');
        rl.close();
        return;
    }
    
    rl.close();
  } catch (error) {
    console.error('版本号自增失败:', error.message);
    rl.close();
  }
}); 