# 📤 推送代码到 GitHub 的简易指南

## 方法一：使用命令行（需要 Token）

### 步骤 1：生成 GitHub Personal Access Token

1. 访问：https://github.com/settings/tokens
2. 点击 **"Generate new token"** → **"Generate new token (classic)"**
3. 填写信息：
   - Note: `cursor-game-deploy`
   - Expiration: `90 days` 
   - 勾选权限：✅ `repo` (完整的仓库访问权限)
4. 点击底部的 **"Generate token"**
5. ⚠️ **立即复制** token（只显示一次！）

### 步骤 2：推送代码

在终端执行：

```bash
cd /Users/fudongxiao/Downloads/AllCode/cursor-game
git push -u origin main
```

当要求输入：
- **Username**: helloXiaoFu
- **Password**: 粘贴刚才复制的 token

✅ 推送完成！

---

## 方法二：使用 GitHub Desktop（最简单，推荐）

### 1. 下载安装 GitHub Desktop

访问：https://desktop.github.com/
下载并安装 GitHub Desktop

### 2. 登录账号

打开 GitHub Desktop，使用你的 GitHub 账号登录

### 3. 添加仓库

1. 点击 **"File"** → **"Add Local Repository"**
2. 选择路径：`/Users/fudongxiao/Downloads/AllCode/cursor-game`
3. 点击 **"Add Repository"**

### 4. 发布仓库

1. 点击顶部的 **"Publish repository"** 按钮
2. 确认仓库名称为：`ghost-match-game`
3. 点击 **"Publish Repository"**

✅ 推送完成！超级简单！

---

## 方法三：使用 SSH（一次配置，永久使用）

### 1. 生成 SSH 密钥

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

一路回车即可

### 2. 复制公钥

```bash
cat ~/.ssh/id_ed25519.pub
```

复制输出的内容

### 3. 添加到 GitHub

1. 访问：https://github.com/settings/keys
2. 点击 **"New SSH key"**
3. Title: `My Mac`
4. Key: 粘贴刚才复制的公钥
5. 点击 **"Add SSH key"**

### 4. 修改远程仓库地址为 SSH

```bash
cd /Users/fudongxiao/Downloads/AllCode/cursor-game
git remote set-url origin git@github.com:helloXiaoFu/ghost-match-game.git
git push -u origin main
```

✅ 推送完成！以后都不需要输入密码了！

---

## 🎯 推荐方案

- **最快速**：方法二（GitHub Desktop）
- **长期使用**：方法三（SSH）
- **临时使用**：方法一（Token）

选择一个适合你的方法即可！

