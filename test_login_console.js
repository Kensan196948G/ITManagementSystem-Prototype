// ブラウザのコンソールで実行するテストコード
// F12でデベロッパーツールを開き、Consoleタブで以下のコードを貼り付けて実行してください

async function testLogin() {
    console.log('=== ログインテスト開始 ===');
    
    try {
        // 1. ログインAPIをテスト
        console.log('1. ログインAPIへリクエスト送信中...');
        const loginResponse = await fetch('http://192.168.3.135:8000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        console.log('ログインレスポンス:', loginData);
        
        if (!loginData.access_token) {
            console.error('❌ access_tokenが取得できません');
            return;
        }
        
        console.log('✅ access_token取得成功:', loginData.access_token);
        
        // 2. トークンをlocalStorageに保存
        localStorage.setItem('token', loginData.access_token);
        console.log('✅ トークンをlocalStorageに保存しました');
        
        // 3. ユーザー情報を取得
        console.log('2. ユーザー情報を取得中...');
        const meResponse = await fetch('http://192.168.3.135:8000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${loginData.access_token}`
            }
        });
        
        const userData = await meResponse.json();
        console.log('ユーザー情報:', userData);
        
        // 4. ユーザー情報をlocalStorageに保存
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ ユーザー情報をlocalStorageに保存しました');
        
        console.log('\n=== ログインテスト成功！===');
        console.log('ダッシュボードへリダイレクトできます');
        
        // 5. 実際のログインフローをテスト
        console.log('\n3. 実際のアプリケーションでログインを試みます...');
        
        // authServiceが利用可能か確認
        if (window.authService) {
            console.log('authServiceを使用してログイン...');
            await window.authService.login({ username: 'admin', password: 'admin123' });
        } else {
            console.log('authServiceが見つかりません。ページをリロードして再試行してください。');
        }
        
    } catch (error) {
        console.error('❌ エラー発生:', error);
        console.error('詳細:', error.message);
        if (error.stack) {
            console.error('スタックトレース:', error.stack);
        }
    }
}

// localStorageの内容を確認
function checkStorage() {
    console.log('=== LocalStorage確認 ===');
    console.log('token:', localStorage.getItem('token'));
    console.log('user:', localStorage.getItem('user'));
}

// クリーンアップ
function clearAuth() {
    console.log('認証情報をクリア中...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ クリア完了');
}

console.log('📝 使用方法:');
console.log('testLogin() - ログインをテスト');
console.log('checkStorage() - LocalStorageの内容を確認');
console.log('clearAuth() - 認証情報をクリア');

// 自動実行
testLogin();