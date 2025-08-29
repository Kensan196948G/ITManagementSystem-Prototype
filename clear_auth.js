/**
 * 認証状態をクリアしてログインページからやり直すためのスクリプト
 * ブラウザコンソール（F12 → Console）で実行してください
 */

// 認証情報をクリア
function clearAuth() {
    console.log('🧹 認証情報をクリアします...');
    
    // LocalStorageから認証関連のデータを削除
    const keysToRemove = ['token', 'user', 'refreshToken'];
    
    keysToRemove.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            console.log(`  ❌ ${key} を削除`);
            localStorage.removeItem(key);
        }
    });
    
    // SessionStorageもクリア（念のため）
    sessionStorage.clear();
    
    console.log('✅ 認証情報のクリア完了');
    console.log('📍 ログインページへリダイレクトします...');
    
    // ログインページへ強制リダイレクト
    window.location.href = 'http://192.168.3.135:5176/login';
}

// 現在の認証状態を確認
function checkAuthStatus() {
    console.log('🔍 現在の認証状態:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token) {
        console.log('✅ トークンあり');
        console.log(`   長さ: ${token.length} 文字`);
        console.log(`   先頭20文字: ${token.substring(0, 20)}...`);
    } else {
        console.log('❌ トークンなし');
    }
    
    if (user) {
        try {
            const userData = JSON.parse(user);
            console.log('✅ ユーザー情報あり');
            console.log(`   ユーザー名: ${userData.username || '不明'}`);
            console.log(`   メール: ${userData.email || '不明'}`);
            console.log(`   役割: ${userData.role || '不明'}`);
        } catch (e) {
            console.log('⚠️ ユーザー情報が不正です');
        }
    } else {
        console.log('❌ ユーザー情報なし');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (token && user) {
        console.log('📋 状態: ログイン済み（ダッシュボードが表示されます）');
        console.log('💡 ヒント: clearAuth() を実行してログアウトできます');
    } else {
        console.log('📋 状態: 未ログイン（ログインページが表示されます）');
    }
}

// 完全なログインフローテスト
async function testFullLoginFlow() {
    console.log('🎯 完全なログインフローテスト');
    console.log('═══════════════════════════════════════════');
    
    // Step 1: 認証情報クリア
    console.log('\n📋 Step 1: 認証情報をクリア');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    console.log('✅ クリア完了');
    
    // Step 2: 現在のURL確認
    console.log('\n📋 Step 2: 現在のURL');
    console.log(`📍 ${window.location.href}`);
    
    // Step 3: 適切なページへの誘導
    const currentPath = window.location.pathname;
    
    if (currentPath === '/dashboard' || currentPath === '/') {
        console.log('\n⚠️ ログインが必要です');
        console.log('📍 ログインページへ移動します...');
        console.log('\n次の手順:');
        console.log('1. ログインページが表示されるのを待つ');
        console.log('2. ユーザー名: admin');
        console.log('3. パスワード: admin123');
        console.log('4. ログインボタンをクリック');
        console.log('5. 自動的にダッシュボードへリダイレクトされることを確認');
        
        // 3秒後にログインページへリダイレクト
        setTimeout(() => {
            window.location.href = 'http://192.168.3.135:5176/login';
        }, 3000);
    } else if (currentPath === '/login') {
        console.log('✅ すでにログインページにいます');
        console.log('\n次の手順:');
        console.log('1. ユーザー名: admin');
        console.log('2. パスワード: admin123');
        console.log('3. ログインボタンをクリック');
        console.log('4. 自動的にダッシュボードへリダイレクトされることを確認');
    }
}

console.log('🔧 使用可能なコマンド:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('checkAuthStatus()    - 現在の認証状態を確認');
console.log('clearAuth()         - 認証情報をクリアしてログインページへ');
console.log('testFullLoginFlow() - 完全なログインフローをテスト');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n💡 まず checkAuthStatus() で現在の状態を確認してください');

// 自動で現在の状態を表示
checkAuthStatus();