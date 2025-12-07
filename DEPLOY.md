# 🚀 部署到 Vercel 指南

本文档详细说明如何将小鬼消消乐游戏部署到 Vercel。

## 📋 前提条件

- 一个 Vercel 账号（免费）- [注册地址](https://vercel.com/signup)
- Git 已安装（方法2需要）
- Node.js 已安装（方法1需要）

---

## 方法一：使用 Vercel CLI（推荐，最快速）

### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 2. 登录 Vercel

```bash
vercel login
```

按照提示完成登录（会打开浏览器）

### 3. 部署项目

在项目目录下运行：

```bash
cd /Users/fudongxiao/Downloads/AllCode/cursor-game
vercel
```

首次部署时会询问几个问题：
- `Set up and deploy "~/Downloads/AllCode/cursor-game"?` → 输入 `Y`
- `Which scope do you want to deploy to?` → 选择你的账号
- `Link to existing project?` → 输入 `N`
- `What's your project's name?` → 输入 `ghost-match-game` 或其他名字
- `In which directory is your code located?` → 直接回车（当前目录）
- `Want to override the settings?` → 输入 `N`

### 4. 生产环境部署

如果要部署到生产环境（正式版本）：

```bash
vercel --prod
```

### 5. 完成！

部署完成后，会显示：
```
✅  Production: https://ghost-match-game.vercel.app
```

点击链接即可访问你的游戏！

---

## 方法二：通过 GitHub 自动部署（推荐，适合长期维护）

### 1. 创建 GitHub 仓库

```bash
cd /Users/fudongxiao/Downloads/AllCode/cursor-game

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "🎮 Initial commit: Ghost Match Game"

# 在 GitHub 创建新仓库后，添加远程仓库
git remote add origin https://github.com/你的用户名/ghost-match-game.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 2. 连接 Vercel 和 GitHub

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 选择 "Import Git Repository"
4. 授权 GitHub（如果还没授权）
5. 选择你的 `ghost-match-game` 仓库
6. 点击 "Import"

### 3. 配置项目（通常默认配置即可）

- **Framework Preset**: Other
- **Root Directory**: ./
- **Build Command**: 留空
- **Output Directory**: ./

点击 "Deploy"

### 4. 自动部署

现在每次你推送代码到 GitHub，Vercel 会自动重新部署！

```bash
# 修改代码后
git add .
git commit -m "更新游戏功能"
git push

# Vercel 会自动部署新版本
```

---

## 方法三：拖拽上传（最简单，适合一次性部署）

### 1. 访问 Vercel

访问 [Vercel Dashboard](https://vercel.com/dashboard)

### 2. 拖拽上传

1. 点击 "Add New..." → "Project"
2. 选择 "Deploy from Template" 下方的 "Browse"
3. 或者直接拖拽整个 `cursor-game` 文件夹到页面上

### 3. 完成

等待几秒钟，部署完成！

---

## 🎯 部署后的操作

### 查看部署状态

```bash
vercel ls
```

### 查看部署日志

```bash
vercel logs [deployment-url]
```

### 自定义域名（可选）

1. 在 Vercel Dashboard 进入项目
2. 点击 "Settings" → "Domains"
3. 添加你的自定义域名
4. 按照提示配置 DNS

### 环境变量（本项目不需要）

如果将来需要添加环境变量：
1. 进入项目 Settings
2. 选择 "Environment Variables"
3. 添加变量

---

## 📱 部署后的访问

你的游戏将可以通过以下方式访问：

- **Vercel 提供的域名**: `https://ghost-match-game.vercel.app`
- **自定义域名**（如果配置了）: `https://yourdomain.com`
- **预览链接**（每次部署都会生成）

---

## 🔧 故障排查

### 问题：部署失败

**解决方案**：
- 检查所有文件是否都在同一目录
- 确保 `index.html`、`style.css`、`game.js` 文件名正确
- 查看 Vercel 部署日志获取详细错误信息

### 问题：页面显示空白

**解决方案**：
- 打开浏览器开发者工具（F12）查看控制台错误
- 确认所有文件路径正确
- 清除浏览器缓存后重试

### 问题：样式没有加载

**解决方案**：
- 检查 `style.css` 文件是否存在
- 确认 `index.html` 中的 CSS 引用路径正确

---

## 📊 Vercel 免费额度

Vercel 免费计划包括：
- ✅ 无限部署
- ✅ 100GB 带宽/月
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动 CI/CD

完全够个人项目使用！

---

## 🎉 下一步

部署完成后，你可以：
1. 分享链接给朋友试玩
2. 在社交媒体分享
3. 继续开发新功能
4. 添加统计分析（如 Google Analytics）

Happy Deploying! 🚀

