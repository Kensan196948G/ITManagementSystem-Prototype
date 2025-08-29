# Python 環境設定手順

本ドキュメントは、本プロジェクトのバックエンドおよび自己修復ループ関連スクリプトを実行するために必要なPython環境の構築手順を説明します。

## 1. Pythonのインストール

お使いのオペレーティングシステムに応じて、以下のいずれかの方法でPython 3.8以上のバージョンをインストールしてください。

- **Windows:**
  Python公式サイトからインストーラーをダウンロードし、実行してください。インストール時に「Add Python to PATH」のオプションを必ず有効にしてください。
  [Python Downloads (Windows)](https://www.python.org/downloads/windows/)

- **macOS:**
  Homebrewを使用するのが最も簡単な方法です。ターミナルを開き、以下のコマンドを実行してください。
  ```bash
  brew install python
  ```

- **Linux:**
  多くのLinuxディストリビューションにはPythonがプリインストールされていますが、バージョンが古い場合があります。お使いのディストリビューションのパッケージマネージャーを使用して、Python 3.8以上のバージョンをインストールしてください。
  例 (Debian/Ubuntu):
  ```bash
  sudo apt update
  sudo apt install python3 python3-pip
  ```
  例 (Fedora):
  ```bash
  sudo dnf install python3 python3-pip
  ```

インストール後、ターミナルで以下のコマンドを実行し、Pythonが正しくインストールされ、パスが通っていることを確認してください。
```bash
python --version
python3 --version # python3 コマンドの場合
```

## 2. 仮想環境の構築 (推奨)

プロジェクトごとに依存ライブラリを分離するために、仮想環境を使用することを強く推奨します。プロジェクトのルートディレクトリで以下のコマンドを実行してください。

```bash
python -m venv .venv
```
または
```bash
python3 -m venv .venv # python3 コマンドの場合
```

これにより、プロジェクトルートに `.venv` という名前の仮想環境が作成されます。

## 3. 仮想環境のアクティベート

仮想環境を使用するには、各ターミナルセッションでアクティベートする必要があります。

- **Windows (Command Prompt):**
  ```bash
  .venv\Scripts\activate
  ```

- **Windows (PowerShell):**
  ```powershell
  .venv\Scripts\Activate.ps1
  ```

- **macOS および Linux (Bash/Zsh):**
  ```bash
  source .venv/bin/activate
  ```

仮想環境がアクティベートされると、ターミナルのプロンプトの先頭に `(.venv)` のような表示が追加されます。

## 4. 依存ライブラリのインストール

仮想環境をアクティベートした状態で、プロジェクトのルートディレクトリにある `backend/requirements.txt` にリストされている依存ライブラリをインストールします。

```bash
pip install -r backend/requirements.txt
```
または
```bash
pip3 install -r backend/requirements.txt # pip3 コマンドの場合
```

これにより、必要なライブラリが仮想環境内にインストールされます。

## 5. 環境変数の設定

プロジェクトによっては、`.env` ファイルを使用して環境変数を設定します。プロジェクトルートに `.env` ファイルが存在する場合は、スクリプト実行時に自動的に読み込まれるか、または `python-dotenv` のようなライブラリを使用して明示的に読み込む必要があります。

`.env` ファイルの具体的な内容はプロジェクトの要件によりますが、SECRET_KEYなどの機密情報は安全に管理してください。

---

上記の手順でPython環境が構築され、プロジェクトの実行準備が整います。