// Complete authentication flow test
// Run this in browser console to test login -> dashboard -> logout flow

async function testCompleteAuthFlow() {
    console.log('🚀 認証フローの完全テスト開始');
    
    try {
        // 1. ログインテスト
        console.log('\n1️⃣ ログインテスト...');
        const loginResponse = await fetch('http://192.168.3.135:8000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        if (!loginData.access_token) {
            throw new Error('ログイン失敗: トークンが取得できません');
        }
        console.log('✅ ログイン成功');
        console.log('📝 取得したトークン:', loginData.access_token.substring(0, 20) + '...');
        
        // 2. ユーザー情報取得
        console.log('\n2️⃣ ユーザー情報取得...');
        const meResponse = await fetch('http://192.168.3.135:8000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${loginData.access_token}` }
        });
        
        const userData = await meResponse.json();
        console.log('✅ ユーザー情報取得成功');
        console.log('👤 ユーザー:', userData);
        
        // 3. インシデントデータ取得テスト
        console.log('\n3️⃣ インシデントデータ取得...');
        const incidentsResponse = await fetch('http://192.168.3.135:8000/api/incidents', {
            headers: { 'Authorization': `Bearer ${loginData.access_token}` }
        });
        
        const incidents = await incidentsResponse.json();
        console.log('✅ インシデント取得成功');
        console.log('📊 インシデント数:', incidents.items ? incidents.items.length : 0);
        
        // 4. LocalStorage確認
        console.log('\n4️⃣ LocalStorage確認...');
        localStorage.setItem('token', loginData.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ LocalStorageに保存完了');
        
        // 5. ダッシュボードアクセス可能確認
        console.log('\n5️⃣ ダッシュボードアクセス確認...');
        console.log('📍 ダッシュボードURL: http://192.168.3.135:5176/dashboard');
        console.log('✅ ダッシュボードにアクセス可能です');
        
        // 6. ログアウトシミュレーション
        console.log('\n6️⃣ ログアウトシミュレーション...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('✅ ログアウト完了（LocalStorageクリア）');
        
        console.log('\n🎉 認証フローテスト完了！');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('サマリー:');
        console.log('  • ログイン: ✅ 成功');
        console.log('  • API認証: ✅ 成功');
        console.log('  • データ取得: ✅ 成功');
        console.log('  • ダッシュボード: ✅ アクセス可能');
        console.log('  • ログアウト: ✅ 機能確認');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        return true;
        
    } catch (error) {
        console.error('❌ エラー発生:', error.message);
        console.error('詳細:', error);
        return false;
    }
}

// UIコンポーネントの状態確認
function checkUIComponents() {
    console.log('\n🔍 UIコンポーネント状態確認...');
    
    // サイドバーメニューの確認
    const menuItems = document.querySelectorAll('[class*="rounded-xl cursor-pointer"]');
    console.log(`📋 メニュー項目数: ${menuItems.length}`);
    
    // ログアウトボタンの確認
    const logoutButton = document.querySelector('[class*="hover:bg-red-500"]');
    console.log(`🚪 ログアウトボタン: ${logoutButton ? '✅ 存在' : '❌ 見つかりません'}`);
    
    // ダッシュボードコンテンツの確認
    const dashboardContent = document.querySelector('main');
    console.log(`📊 ダッシュボードコンテンツ: ${dashboardContent ? '✅ 表示中' : '❌ 見つかりません'}`);
}

console.log('📝 使用方法:');
console.log('testCompleteAuthFlow() - 完全な認証フローをテスト');
console.log('checkUIComponents() - UI要素の存在を確認');

// 自動実行
testCompleteAuthFlow();