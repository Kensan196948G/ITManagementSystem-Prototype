# PowerShellスクリプト: バックエンドテストを正しいディレクトリで実行する

# packages/backendディレクトリに移動
Set-Location -Path "packages/backend"

# pytestを実行
pytest --maxfail=1 --disable-warnings -q