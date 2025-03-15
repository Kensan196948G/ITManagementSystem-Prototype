const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certDir = path.join(__dirname, '..', 'certificates');

// 証明書ディレクトリが存在しない場合は作成
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
  console.log(`ディレクトリを作成しました: ${certDir}`);
}

// openssl コマンドを実行して自己署名証明書を生成
try {
  console.log('自己署名SSL証明書を生成中...');
  
  // 証明書と秘密鍵のパス
  const keyPath = path.join(certDir, 'key.pem');
  const certPath = path.join(certDir, 'cert.pem');

  // 秘密鍵の生成
  execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });
  console.log('秘密鍵を生成しました');

  // 証明書署名要求（CSR）の生成
  execSync(`openssl req -new -key "${keyPath}" -out "${certDir}/csr.pem" -subj "/C=JP/ST=Tokyo/L=Tokyo/O=ITS Management System/CN=localhost"`, { stdio: 'inherit' });
  console.log('証明書署名要求（CSR）を生成しました');

  // 自己署名証明書の生成
  execSync(`openssl x509 -req -days 365 -in "${certDir}/csr.pem" -signkey "${keyPath}" -out "${certPath}"`, { stdio: 'inherit' });
  console.log('自己署名証明書を生成しました');

  // CSRファイルの削除
  fs.unlinkSync(path.join(certDir, 'csr.pem'));

  console.log('証明書の生成が完了しました！');
  console.log(`証明書の場所: ${certPath}`);
  console.log(`秘密鍵の場所: ${keyPath}`);
  console.log('\n開発サーバーを起動するには: npm start');
  console.log('\n注意: 自己署名証明書のため、ブラウザでセキュリティ警告が表示されます。');
  console.log('開発目的のみに使用してください。');
} catch (error) {
  console.error('証明書の生成に失敗しました:', error.message);
  process.exit(1);
}
