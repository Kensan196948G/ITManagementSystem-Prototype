const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certDir = path.join(__dirname, '..', 'certificates');

// 証明書ディレクトリが存在しない場合は作成
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
  console.log(`ディレクトリを作成しました: ${certDir}`);
}

// Node.js の crypto を使用して証明書を生成
try {
  console.log('自己署名SSL証明書を生成中...');

  // SSL証明書の生成に必要なパッケージをインストール
  console.log('証明書生成に必要なパッケージをインストールしています...');
  execSync('npm install -D node-forge', { stdio: 'inherit' });
  
  // 証明書生成のためにNode.jsスクリプトを実行
  const forge = require('node-forge');
  const pki = forge.pki;
  
  // 証明書と秘密鍵のパス
  const keyPath = path.join(certDir, 'key.pem');
  const certPath = path.join(certDir, 'cert.pem');
  
  console.log('RSA鍵ペア生成中...');
  // RSA鍵ペアを生成
  const keys = pki.rsa.generateKeyPair(2048);
  
  console.log('証明書生成中...');
  // 証明書を作成
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  
  // 証明書属性を設定
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  
  // 証明書のSubject Name
  const attrs = [{
    name: 'commonName',
    value: 'localhost'
  }, {
    name: 'countryName',
    value: 'JP'
  }, {
    name: 'stateOrProvinceName',
    value: 'Tokyo'
  }, {
    name: 'localityName',
    value: 'Tokyo'
  }, {
    name: 'organizationName',
    value: 'ITS Management System'
  }];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs); // 自己署名証明書
  
  // 拡張情報を設定
  cert.setExtensions([{
    name: 'basicConstraints',
    cA: false
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 2, // DNS
      value: 'localhost'
    }]
  }]);
  
  // 証明書に署名
  cert.sign(keys.privateKey, forge.md.sha256.create());
  
  // PEM形式で保存
  const privKeyPem = pki.privateKeyToPem(keys.privateKey);
  const certPem = pki.certificateToPem(cert);
  
  // ファイルに保存
  fs.writeFileSync(keyPath, privKeyPem);
  fs.writeFileSync(certPath, certPem);
  
  console.log('証明書の生成が完了しました！');
  console.log(`証明書の場所: ${certPath}`);
  console.log(`秘密鍵の場所: ${keyPath}`);
  console.log('\n開発サーバーを起動するには: npm run start:https');
  console.log('\n注意: 自己署名証明書のため、ブラウザでセキュリティ警告が表示されます。');
  console.log('開発目的のみに使用してください。');
} catch (error) {
  console.error('証明書の生成に失敗しました:', error.message);
  process.exit(1);
}
