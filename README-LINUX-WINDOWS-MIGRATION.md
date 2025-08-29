# Linux ↔ Windows11 完全移行ガイド

**ITサービス管理システム - Linux/Windows11 双方向移行対応版**

このガイドは、ITManagementSystem-PrototypeプロジェクトをLinuxとWindows11の間で完全移行するための専用手順書です。

## 🔄 移行パターン

### 対応移行パターン
- ✅ **Linux → Windows11**: Linuxで開発したプロジェクトをWindows11に移行
- ✅ **Windows11 → Linux**: Windows11で開発したプロジェクトをLinuxに移行

### 非対応移行パターン
- ❌ **macOS**: macOSへの移行は対象外

## 🚀 ワンクリック移行（推奨方法）

### 手順1: プロジェクトコピー
```bash
# 移行元からプロジェクト全体をコピー
# Windows: エクスプローラーでコピー&ペースト
# Linux: cp -r または rsync
```

### 手順2: プラットフォーム自動変換
プロジェクトディレクトリで以下のコマンドを実行：

```bash
# プラットフォーム固有変換実行
node migrate-linux-windows.cjs

# 検証実行
node migrate-linux-windows.cjs verify
```

### 手順3: 環境セットアップ
**Linux環境:**
```bash
./migrate-to-new-environment.sh
```

**Windows11環境:**
```cmd
migrate-to-new-environment.bat
```

## 🔧 詳細移行手順

### Linux → Windows11 移行

#### 事前準備（Linux側）
```bash
# 1. プロジェクト状態の確認
node migrate-linux-windows.cjs verify

# 2. Git状態のクリーンアップ（推奨）
git add .
git commit -m "Before migration to Windows11"
```

#### Windows11での作業
```cmd
REM 1. Node.js, Python, Git がインストール済みであることを確認
node --version
python --version
git --version

REM 2. プロジェクトディレクトリに移動
cd ITManagementSystem-Prototype

REM 3. プラットフォーム変換実行
node migrate-linux-windows.cjs

REM 4. 環境自動セットアップ
migrate-to-new-environment.bat

REM 5. 検証
npm run dev
```

### Windows11 → Linux 移行

#### 事前準備（Windows11側）
```cmd
REM 1. プロジェクト状態の確認
node migrate-linux-windows.js verify

REM 2. Git状態のクリーンアップ（推奨）
git add .
git commit -m "Before migration to Linux"
```

#### Linuxでの作業
```bash
# 1. Node.js, Python, Git がインストール済みであることを確認
node --version
python3 --version
git --version

# 2. プロジェクトディレクトリに移動
cd ITManagementSystem-Prototype

# 3. プラットフォーム変換実行
node migrate-linux-windows.cjs

# 4. 環境自動セットアップ
chmod +x migrate-to-new-environment.sh
./migrate-to-new-environment.sh

# 5. 検証
npm run dev
```

## ⚙️ 自動変換される項目

### ファイル・ディレクトリ構造
- ✅ **パス区切り文字**: `/` ↔ `\` 自動変換
- ✅ **実行ファイル拡張子**: `.sh` ↔ `.bat` 自動生成
- ✅ **Python仮想環境**: `venv/bin/` ↔ `venv/Scripts/` 対応

### ファイル内容
- ✅ **改行コード**: LF ↔ CRLF 自動変換
- ✅ **環境変数記法**: `${VAR}` ↔ `%VAR%` 自動変換
- ✅ **コマンド変換**: `python3` ↔ `python`, `pip3` ↔ `pip`
- ✅ **パッケージスクリプト**: package.json内のスクリプトパス自動調整

### Git設定
- ✅ **.gitattributes**: クロスプラットフォーム対応の改行コード設定
- ✅ **バイナリファイル**: 適切なGit LFS設定

## 📋 移行チェックリスト

### Linux → Windows11
- [ ] Windows11にNode.js LTSをインストール
- [ ] Windows11にPython 3.8+をインストール  
- [ ] Windows11にGitをインストール
- [ ] プロジェクトをコピー
- [ ] `node migrate-linux-windows.js` 実行
- [ ] `migrate-to-new-environment.bat` 実行
- [ ] 動作確認（`npm run dev`）

### Windows11 → Linux
- [ ] LinuxにNode.js LTSをインストール
- [ ] LinuxにPython 3.8+をインストール
- [ ] LinuxにGitをインストール
- [ ] プロジェクトをコピー
- [ ] `node migrate-linux-windows.js` 実行
- [ ] `./migrate-to-new-environment.sh` 実行
- [ ] 動作確認（`npm run dev`）

## 🐛 プラットフォーム固有の注意点

### Windows11固有
```cmd
REM PowerShell実行ポリシー設定
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

REM 長いパス名サポート（必要に応じて）
git config --global core.longpaths true

REM Python環境確認
python --version
pip --version
```

### Linux固有
```bash
# 必要なシステムパッケージ
sudo apt update
sudo apt install -y build-essential curl wget git python3-dev python3-pip python3-venv

# ファイル監視数制限調整（必要に応じて）
echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# ファイル権限確認
chmod +x *.sh
```

## 🔍 トラブルシューティング

### よくある問題と解決法

#### 1. 改行コード問題
**症状**: スクリプトが実行できない、文法エラーが出る

**解決法**:
```bash
# Linux で CRLF を LF に変換
dos2unix *.sh *.js *.json

# Windows で LF を CRLF に変換
unix2dos *.bat *.ps1
```

#### 2. パス区切り文字問題
**症状**: ファイルが見つからない、パスエラー

**解決法**:
```bash
# 移行スクリプト再実行
node migrate-linux-windows.js
```

#### 3. Python仮想環境エラー
**症状**: venvが認識されない

**解決法**:
```bash
# 仮想環境削除・再作成
rm -rf venv                    # Linux
rmdir /s venv                  # Windows

# 仮想環境再作成
python3 -m venv venv           # Linux  
python -m venv venv            # Windows
```

#### 4. npm権限エラー（Linux）
**症状**: npm installで権限エラー

**解決法**:
```bash
# npm設定調整
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### 5. 文字コード問題
**症状**: 日本語が文字化けする

**解決法**:
```bash
# Linux
export LANG=ja_JP.UTF-8
export LC_ALL=ja_JP.UTF-8

# Windows (コマンドプロンプト)
chcp 65001
```

## 📊 パフォーマンス最適化

### Windows11での最適化
```cmd
REM Windows Defender除外設定（開発フォルダ）
REM セキュリティ設定 → ウイルスと脅威の防止 → 除外設定

REM SSD最適化（Windows11）
defrag C: /O
```

### Linuxでの最適化
```bash
# ファイルシステム最適化
sudo tune2fs -o journal_data_writeback /dev/sda1

# スワップ使用量調整（16GB以上メモリがある場合）
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

## 📈 運用のベストプラクティス

### 開発環境の統一
1. **Docker使用** (推奨)
   - プラットフォーム差異を完全に解消
   - 一貫した開発環境を提供

2. **WSL2使用** (Windows11のみ)
   - WindowsでLinux環境を直接実行
   - ネイティブLinuxコマンド使用可能

3. **VM使用**
   - 完全分離された環境
   - スナップショット機能

### Git運用の統一
```bash
# 共通Git設定
git config --global core.autocrlf input    # Linux
git config --global core.autocrlf true     # Windows

# 共通ignore設定
echo "node_modules/" >> .gitignore
echo "venv/" >> .gitignore
echo "*.log" >> .gitignore
echo "*.db" >> .gitignore
```

## 🆘 サポート・コミュニティ

### トラブル解決の順序
1. **移行スクリプト再実行**: `node migrate-linux-windows.cjs`
2. **環境セットアップ再実行**: 移行スクリプト実行
3. **依存関係クリーンインストール**: `rm -rf node_modules && npm install`
4. **仮想環境再作成**: venv削除→再作成
5. **システム再起動**: OS再起動

### ログ確認コマンド
```bash
# アプリケーションログ
tail -f logs/*.log

# NPMデバッグログ
npm install --loglevel verbose

# Pythonデバッグ実行
python -v app.py
```

---

**最終更新**: 2025年8月29日  
**対象プラットフォーム**: Linux ↔ Windows11  
**バージョン**: v2.0