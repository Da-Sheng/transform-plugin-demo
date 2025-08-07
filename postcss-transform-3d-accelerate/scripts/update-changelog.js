#!/usr/bin/env node

/**
 * 更新CHANGELOG.md文件
 * 
 * 此脚本会自动更新CHANGELOG.md文件，添加新版本的信息
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取package.json中的版本号
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// 获取当前日期
const today = new Date();
const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

// 读取CHANGELOG.md文件
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf8');

// 获取最近的提交记录
let commits;
try {
  // 获取上一个版本标签
  const tags = execSync('git tag -l --sort=-v:refname').toString().trim().split('\n');
  const previousTag = tags.length > 1 ? tags[1] : null;
  
  // 获取从上一个标签到现在的所有提交
  const gitLogCommand = previousTag 
    ? `git log ${previousTag}..HEAD --pretty=format:"%s" --no-merges`
    : 'git log --pretty=format:"%s" --no-merges -n 10';
  
  commits = execSync(gitLogCommand).toString().trim().split('\n')
    .filter(commit => !commit.startsWith('chore(release):'));
} catch (error) {
  console.error('获取Git提交记录失败，将使用默认变更记录');
  commits = ['- 更新版本'];
}

// 整理提交记录，按类型分组
const commitGroups = {
  feat: [],
  fix: [],
  perf: [],
  refactor: [],
  docs: [],
  test: [],
  chore: [],
  other: []
};

commits.forEach(commit => {
  const match = commit.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.+)$/);
  if (match) {
    const [, type, scope, message] = match;
    const formattedMessage = scope ? `**${scope}**: ${message}` : message;
    
    if (commitGroups[type]) {
      commitGroups[type].push(formattedMessage);
    } else {
      commitGroups.other.push(formattedMessage);
    }
  } else {
    commitGroups.other.push(commit);
  }
});

// 生成新版本的变更日志内容
let newVersionChangelog = `\n## ${version} (${formattedDate})\n\n`;

// 添加功能特性
if (commitGroups.feat.length > 0) {
  newVersionChangelog += '### 新功能\n\n';
  commitGroups.feat.forEach(feat => {
    newVersionChangelog += `- ${feat}\n`;
  });
  newVersionChangelog += '\n';
}

// 添加修复
if (commitGroups.fix.length > 0) {
  newVersionChangelog += '### 修复\n\n';
  commitGroups.fix.forEach(fix => {
    newVersionChangelog += `- ${fix}\n`;
  });
  newVersionChangelog += '\n';
}

// 添加性能优化
if (commitGroups.perf.length > 0) {
  newVersionChangelog += '### 性能优化\n\n';
  commitGroups.perf.forEach(perf => {
    newVersionChangelog += `- ${perf}\n`;
  });
  newVersionChangelog += '\n';
}

// 添加重构
if (commitGroups.refactor.length > 0) {
  newVersionChangelog += '### 重构\n\n';
  commitGroups.refactor.forEach(refactor => {
    newVersionChangelog += `- ${refactor}\n`;
  });
  newVersionChangelog += '\n';
}

// 添加文档更新
if (commitGroups.docs.length > 0) {
  newVersionChangelog += '### 文档\n\n';
  commitGroups.docs.forEach(docs => {
    newVersionChangelog += `- ${docs}\n`;
  });
  newVersionChangelog += '\n';
}

// 添加测试
if (commitGroups.test.length > 0) {
  newVersionChangelog += '### 测试\n\n';
  commitGroups.test.forEach(test => {
    newVersionChangelog += `- ${test}\n`;
  });
  newVersionChangelog += '\n';
}

// 添加其他变更
const otherChanges = [...commitGroups.chore, ...commitGroups.other];
if (otherChanges.length > 0) {
  newVersionChangelog += '### 其他\n\n';
  otherChanges.forEach(other => {
    newVersionChangelog += `- ${other}\n`;
  });
  newVersionChangelog += '\n';
}

// 如果没有任何变更记录，添加一个默认条目
if (Object.values(commitGroups).every(group => group.length === 0)) {
  newVersionChangelog += '- 更新版本\n\n';
}

// 插入新版本的变更日志
const changelogLines = changelog.split('\n');
let insertIndex = 3; // 默认在标题后插入

// 查找第一个版本标题的位置
for (let i = 0; i < changelogLines.length; i++) {
  if (changelogLines[i].startsWith('## ') && changelogLines[i] !== '## 未发布') {
    insertIndex = i;
    break;
  }
}

// 插入新版本的变更日志
changelogLines.splice(insertIndex, 0, newVersionChangelog);
changelog = changelogLines.join('\n');

// 更新CHANGELOG.md文件
fs.writeFileSync(changelogPath, changelog);

console.log(`已更新CHANGELOG.md，添加了版本 ${version} 的变更记录`); 