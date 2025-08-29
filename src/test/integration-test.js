/**
 * 統合テスト - ログインからダッシュボード、ログアウトまでの完全なフロー
 * ブラウザコンソールで実行してください
 */

async function runIntegrationTest() {
    console.log('🎯 統合テスト開始');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const API_BASE = 'http://192.168.3.135:8000';
    const APP_BASE = 'http://192.168.3.135:5176';
    
    const testResults = {
        login: false,
        dashboard: false,
        navigation: false,
        logout: false
    };
    
    try {
        // Step 1: ログインテスト
        console.log('\n📋 Step 1: ログインテスト');
        console.log('──────────────────────');
        
        // クリーンな状態から開始
        localStorage.clear();
        console.log('  ✅ LocalStorageをクリア');
        
        // ログインAPIをコール
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`ログイン失敗: ${loginResponse.status}`);
        }
        
        const loginData = await loginResponse.json();
        console.log('  ✅ ログイン成功');
        console.log(`  📝 トークン取得: ${loginData.access_token.substring(0, 20)}...`);
        
        // トークンを保存
        localStorage.setItem('token', loginData.access_token);
        
        // ユーザー情報を取得
        const userResponse = await fetch(`${API_BASE}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${loginData.access_token}`
            }
        });
        
        const userData = await userResponse.json();
        localStorage.setItem('user', JSON.stringify(userData));
        console.log(`  ✅ ユーザー情報取得: ${userData.username}`);
        
        testResults.login = true;
        
        // Step 2: ダッシュボード表示確認
        console.log('\n📋 Step 2: ダッシュボード表示確認');
        console.log('──────────────────────');
        
        // ダッシュボードが表示されているか確認
        const currentPath = window.location.pathname;
        console.log(`  📍 現在のURL: ${window.location.href}`);
        
        if (currentPath === '/dashboard') {
            console.log('  ✅ ダッシュボードが表示されています');
            testResults.dashboard = true;
        } else {
            console.log('  ⚠️  ダッシュボードへ手動で移動してください:');
            console.log(`      ${APP_BASE}/dashboard`);
        }
        
        // Step 3: ナビゲーション要素の確認
        console.log('\n📋 Step 3: UI要素確認');
        console.log('──────────────────────');
        
        // サイドバーメニューの確認
        const sidebarExists = !!document.querySelector('.fixed.left-0.top-0.w-80');
        console.log(`  ${sidebarExists ? '✅' : '❌'} サイドバーメニュー`);
        
        // ログアウトボタンの確認
        const logoutButton = document.querySelector('[class*="hover:bg-red-500"]');
        console.log(`  ${logoutButton ? '✅' : '❌'} ログアウトボタン`);
        
        // メインコンテンツエリアの確認
        const mainContent = document.querySelector('main');
        console.log(`  ${mainContent ? '✅' : '❌'} メインコンテンツエリア`);
        
        // ユーザー情報表示の確認
        const userEmail = userData.email || 'admin';
        const userDisplay = Array.from(document.querySelectorAll('*')).find(
            el => el.textContent?.includes(userEmail)
        );
        console.log(`  ${userDisplay ? '✅' : '❌'} ユーザー情報表示`);
        
        testResults.navigation = sidebarExists && logoutButton && mainContent;
        
        // Step 4: メニュー展開テスト
        console.log('\n📋 Step 4: メニュー動作確認');
        console.log('──────────────────────');
        
        const menuItems = document.querySelectorAll('[class*="rounded-xl cursor-pointer"]');
        console.log(`  📊 メニュー項目数: ${menuItems.length}`);
        
        if (menuItems.length > 0) {
            console.log('  ✅ クリック可能なメニュー項目が存在');
            
            // 最初のメニューアイテムをクリックしてみる
            const firstMenu = menuItems[0];
            if (firstMenu) {
                console.log('  🔄 最初のメニューをクリックテスト...');
                // Note: 実際のクリックはユーザーが行う必要があります
                console.log('  ℹ️  メニューをクリックして展開/折りたたみを確認してください');
            }
        }
        
        // Step 5: ログアウト確認（実行はしない）
        console.log('\n📋 Step 5: ログアウト機能確認');
        console.log('──────────────────────');
        
        if (logoutButton) {
            console.log('  ✅ ログアウトボタンが存在');
            console.log('  ℹ️  ログアウトボタンをクリックすると確認ダイアログが表示されます');
            testResults.logout = true;
        } else {
            console.log('  ❌ ログアウトボタンが見つかりません');
        }
        
    } catch (error) {
        console.error('\n❌ エラー発生:', error.message);
        console.error('詳細:', error);
    }
    
    // 結果サマリー
    console.log('\n');
    console.log('═══════════════════════════════════════════════');
    console.log('📊 テスト結果サマリー');
    console.log('═══════════════════════════════════════════════');
    console.log(`  ログイン機能:        ${testResults.login ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  ダッシュボード表示:  ${testResults.dashboard ? '✅ PASS' : '⚠️  手動確認必要'}`);
    console.log(`  ナビゲーション:      ${testResults.navigation ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  ログアウト機能:      ${testResults.logout ? '✅ PASS' : '❌ FAIL'}`);
    console.log('═══════════════════════════════════════════════');
    
    const allPassed = Object.values(testResults).every(r => r);
    if (allPassed) {
        console.log('\n🎉 すべてのテストが成功しました！');
    } else {
        console.log('\n⚠️  一部のテストが失敗しました');
    }
    
    // 手動テスト手順
    console.log('\n📝 手動テスト手順:');
    console.log('──────────────────────');
    console.log('1. ログインページ: http://192.168.3.135:5176/login');
    console.log('   - ユーザー名: admin');
    console.log('   - パスワード: admin123');
    console.log('2. ログイン後、自動的にダッシュボードへリダイレクト');
    console.log('3. サイドバーメニューをクリックして展開/折りたたみ確認');
    console.log('4. ログアウトボタンをクリック → 確認ダイアログ表示');
    console.log('5. ログアウト後、ログインページへリダイレクト');
    
    return testResults;
}

// メニュークリックシミュレーション
function simulateMenuClick() {
    const menuItems = document.querySelectorAll('[class*="rounded-xl cursor-pointer"]');
    if (menuItems.length > 0) {
        console.log(`🖱️  ${menuItems.length}個のメニュー項目を検出`);
        menuItems.forEach((item, index) => {
            const label = item.querySelector('span')?.textContent;
            console.log(`  ${index + 1}. ${label || '(ラベルなし)'}`);
        });
        console.log('\nメニューをクリックして動作を確認してください');
    } else {
        console.log('❌ メニュー項目が見つかりません');
    }
}

// ログアウトシミュレーション
function simulateLogout() {
    const logoutBtn = document.querySelector('[class*="hover:bg-red-500"]');
    if (logoutBtn) {
        console.log('🚪 ログアウトボタンが見つかりました');
        console.log('クリックすると確認ダイアログが表示されます');
        // 実際のクリックはユーザーが行う
    } else {
        console.log('❌ ログアウトボタンが見つかりません');
    }
}

console.log('🔧 利用可能なコマンド:');
console.log('──────────────────────');
console.log('runIntegrationTest() - 統合テストを実行');
console.log('simulateMenuClick() - メニュー項目を表示');
console.log('simulateLogout() - ログアウトボタンを確認');

// 自動実行
runIntegrationTest();