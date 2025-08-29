# プラットフォーム別詳細移行ガイド

**Context7統合による最適化移行手順**

このドキュメントでは、各プラットフォームに特化した移行手順と最適化設定を提供します。

## 🪟 Windows環境

### 前提条件

#### システム要件
- Windows 10 (1903以降) または Windows 11
- RAM: 8GB以上 (16GB推奨)
- ディスク容量: 10GB以上
- PowerShell 5.1以降 (PowerShell 7.0+ 推奨)

#### 必要なツール
```powershell
# 管理者PowerShellで実行
# Wingetインストール (Windows 11では標準)
Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe

# または Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### 高速移行 (推奨)

```powershell
# PowerShellを管理者として実行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# プロジェクト取得
git clone <repository-url> ITManagementSystem-Prototype
cd ITManagementSystem-Prototype

# Context7自動移行実行
PowerShell.exe -ExecutionPolicy Bypass -File scripts/quick-migrate.ps1 -AutoRepair
```

### 手動セットアップ

#### 1. 開発ツールインストール
```powershell
# Node.js LTS
winget install OpenJS.NodeJS.LTS

# Python 3.11
winget install Python.Python.3.11

# Git
winget install Git.Git

# Visual Studio Code (推奨)
winget install Microsoft.VisualStudioCode

# Windows Terminal (推奨)
winget install Microsoft.WindowsTerminal
```

#### 2. 開発環境設定
```powershell
# Visual Studio Build Tools (native modulesに必要)
winget install Microsoft.VisualStudio.2022.BuildTools

# または npm global tools
npm install -g windows-build-tools

# Python開発ヘッダー確認
python -c "import sysconfig; print(sysconfig.get_paths())"
```

#### 3. プロジェクト設定
```powershell
# 長いパス対応
git config --global core.longpaths true

# npm設定最適化
npm config set msvs_version 2022
npm config set python python3

# 環境変数設定
$env:NODE_OPTIONS="--max-old-space-size=4096"
$env:PYTHONIOENCODING="utf-8"
```

### Windows特有の問題解決

#### PowerShell実行ポリシーエラー
```powershell
# 現在のポリシー確認
Get-ExecutionPolicy

# 解決方法
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# または一時的に
PowerShell.exe -ExecutionPolicy Bypass -Command "& {スクリプト内容}"
```

#### 長いファイルパスエラー
```powershell
# Git設定
git config --global core.longpaths true

# Windows設定 (管理者権限必要)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# レジストリ変更後は再起動が必要
```

#### ウイルス対策ソフトの除外設定
```powershell
# Windows Defenderの除外設定例
Add-MpPreference -ExclusionPath "C:\path\to\ITManagementSystem-Prototype"
Add-MpPreference -ExclusionPath "$env:USERPROFILE\AppData\Roaming\npm"
Add-MpPreference -ExclusionProcess "node.exe"
Add-MpPreference -ExclusionProcess "python.exe"
```

## 🍎 macOS環境

### 前提条件

#### システム要件
- macOS 10.15 Catalina以降 (macOS 12+ 推奨)
- RAM: 8GB以上 (16GB推奨)
- ディスク容量: 10GB以上
- Xcode Command Line Tools

#### 必要なツール
```bash
# Xcode Command Line Toolsインストール
xcode-select --install

# Homebrewインストール
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 高速移行 (推奨)

```bash
# プロジェクト取得
git clone <repository-url> ITManagementSystem-Prototype
cd ITManagementSystem-Prototype

# Context7自動移行実行
chmod +x scripts/quick-migrate.sh
./scripts/quick-migrate.sh
```

### 手動セットアップ

#### 1. 開発ツールインストール
```bash
# Homebrew経由で一括インストール
brew install node@18 python@3.11 git

# PATHの設定 (.zshrcまたは.bash_profileに追加)
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
echo 'export PATH="/opt/homebrew/opt/node@18/bin:$PATH"' >> ~/.zshrc
echo 'export PATH="/opt/homebrew/opt/python@3.11/bin:$PATH"' >> ~/.zshrc

# 設定を再読み込み
source ~/.zshrc
```

#### 2. 開発環境最適化
```bash
# npm設定
npm config set python python3

# Git設定
git config --global init.defaultBranch main
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# macOS特有の設定
# .DS_Store無視
echo ".DS_Store" >> ~/.gitignore_global
git config --global core.excludesfile ~/.gitignore_global
```

### macOS特有の問題解決

#### Apple Silicon (M1/M2) 互換性
```bash
# Architecture確認
uname -m

# x86エミュレーション必要時
arch -x86_64 npm install

# Rosetta 2インストール
softwareupdate --install-rosetta

# 環境別プロファイル設定
if [[ $(uname -m) == "arm64" ]]; then
    export CPPFLAGS=-I/opt/homebrew/include
    export LDFLAGS=-L/opt/homebrew/lib
else
    export CPPFLAGS=-I/usr/local/include
    export LDFLAGS=-L/usr/local/lib
fi
```

#### 権限問題
```bash
# npm権限修正
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# または別のプレフィックス使用
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
```

#### Gatekeeper問題
```bash
# 開発者署名のないアプリ実行許可
sudo spctl --master-disable

# または特定のアプリのみ
sudo xattr -rd com.apple.quarantine /path/to/app
```

## 🐧 Linux環境

### 前提条件

#### システム要件
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+ / Fedora 35+
- RAM: 8GB以上
- ディスク容量: 10GB以上
- sudo権限

### 高速移行 (推奨)

```bash
# プロジェクト取得
git clone <repository-url> ITManagementSystem-Prototype
cd ITManagementSystem-Prototype

# Context7自動移行実行
chmod +x scripts/quick-migrate.sh
./scripts/quick-migrate.sh
```

### Debian/Ubuntu系

#### 1. システム更新・基本ツール
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates lsb-release
```

#### 2. 開発ツールインストール
```bash
# Node.js (NodeSource経由)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# ビルド関連
sudo apt install -y build-essential git

# 追加ツール
sudo apt install -y htop tree jq unzip
```

### RHEL/CentOS/Rocky Linux系

#### 1. 基本設定
```bash
sudo dnf update -y
sudo dnf install -y epel-release
sudo dnf groupinstall -y "Development Tools"
```

#### 2. 開発ツールインストール
```bash
# Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs

# Python
sudo dnf install -y python3.11 python3.11-devel python3.11-pip

# 追加ツール
sudo dnf install -y git curl wget htop tree jq
```

### Arch Linux系

```bash
# システム更新
sudo pacman -Syu

# 基本ツール
sudo pacman -S base-devel git nodejs npm python python-pip

# AURヘルパー (yay)
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
```

### Linux特有の問題解決

#### ファイル監視制限
```bash
# inotify制限拡張
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# または一時的
sudo sysctl fs.inotify.max_user_watches=524288
```

#### SELinux設定 (RHEL系)
```bash
# SELinux状態確認
sestatus

# 開発用設定
sudo setsebool -P httpd_can_network_connect 1
sudo semanage port -a -t http_port_t -p tcp 3000
sudo semanage port -a -t http_port_t -p tcp 8000

# または一時的に無効化 (非推奨)
sudo setenforce 0
```

#### ファイアウォール設定
```bash
# Ubuntu (ufw)
sudo ufw allow 3000
sudo ufw allow 8000
sudo ufw enable

# RHEL系 (firewalld)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload

# または一時的に無効化
sudo systemctl stop firewalld
```

## 🐳 Docker環境

### Docker Compose使用

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - BACKEND_URL=http://backend:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - FLASK_ENV=development
      - DATABASE_URL=sqlite:///app/itsm.db
    volumes:
      - ./backend:/app
      - ./itsm.db:/app/itsm.db

  context7:
    image: context7:latest
    ports:
      - "9000:9000"
    volumes:
      - ./context7-config.json:/app/config.json
    depends_on:
      - frontend
      - backend
```

### 起動
```bash
# Context7統合Docker環境起動
docker-compose up --build -d

# ログ監視
docker-compose logs -f
```

## ☁️ クラウド環境

### AWS EC2での展開

```bash
# Amazon Linux 2
sudo yum update -y
sudo yum install -y git

# Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Python
sudo yum install -y python3 python3-devel python3-pip

# プロジェクト展開
git clone <repository-url> ITManagementSystem-Prototype
cd ITManagementSystem-Prototype
./scripts/quick-migrate.sh
```

### Azure VM

```bash
# Ubuntu 20.04 LTS
sudo apt update
sudo apt install -y curl git

# 自動セットアップ
wget -O - https://raw.githubusercontent.com/your-repo/ITManagementSystem-Prototype/main/scripts/quick-migrate.sh | bash
```

### Google Cloud Platform

```bash
# Cloud Shell環境
gcloud config set project YOUR_PROJECT_ID

# VM作成
gcloud compute instances create itsm-instance \
  --machine-type=e2-medium \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB

# SSH接続＆セットアップ
gcloud compute ssh itsm-instance
```

## 📱 統合開発環境 (IDE) 設定

### Visual Studio Code

#### 推奨拡張機能
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss", 
    "ms-python.python",
    "ms-python.pylint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### settings.json
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "python.defaultInterpreterPath": "./backend/venv/Scripts/python",
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true,
    "**/venv": true,
    "**/__pycache__": true
  }
}
```

### JetBrains IDEs

#### WebStorm設定
- Node.js: プロジェクトルートのnode_modules認識
- TypeScript: tsconfig.json自動認識
- Prettier: 保存時自動フォーマット

#### PyCharm設定
- Python Interpreter: ./backend/venv/Scripts/python
- 仮想環境: 自動認識設定

## 🔧 パフォーマンス最適化

### システム別最適化設定

#### Windows
```powershell
# 仮想メモリ設定
$ComputerSystem = Get-WmiObject -Class Win32_ComputerSystem
$TotalPhysicalMemory = [math]::Round($ComputerSystem.TotalPhysicalMemory / 1GB)
$RecommendedPageFileSize = $TotalPhysicalMemory * 1.5

# SSD最適化
fsutil behavior set DisableDeleteNotify 0

# Windows Defenderパフォーマンス
Add-MpPreference -ExclusionPath ".\node_modules"
Add-MpPreference -ExclusionPath ".\backend\venv"
```

#### macOS
```bash
# メモリ圧縮無効化 (必要時)
sudo nvram boot-args="vm_compressor=2"

# Spotlight無効化 (開発用)
sudo mdutil -a -i off

# Dock高速化
defaults write com.apple.dock autohide-time-modifier -float 0.1
killall Dock
```

#### Linux
```bash
# スワップ最適化
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

# I/O スケジューラー最適化 (SSD)
echo 'elevator=noop' | sudo tee -a /etc/default/grub
sudo update-grub

# TCP最適化
echo 'net.core.rmem_max=16777216' | sudo tee -a /etc/sysctl.conf
echo 'net.core.wmem_max=16777216' | sudo tee -a /etc/sysctl.conf
```

## 🧪 環境別テスト

### 自動テストスイート
```bash
# 全環境対応テスト
npm run test:cross-platform

# プラットフォーム固有テスト
npm run test:windows    # Windows専用
npm run test:macos      # macOS専用  
npm run test:linux      # Linux専用

# Context7機能テスト
npm run test:context7-all-platforms
```

---

**🎯 各プラットフォームでの目標**
- セットアップ時間: 5分以内
- 起動時間: 30秒以内  
- メモリ使用量: 2GB以内
- CPU使用率: 平均50%以下

**📞 サポート**
問題が発生した場合は [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) を参照するか、該当するプラットフォームの公式サポートチャンネルをご利用ください。