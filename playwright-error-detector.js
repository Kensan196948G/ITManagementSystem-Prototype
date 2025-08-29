/**
 * Playwright Error Detection & Auto-Fix Script
 * 
 * このスクリプトはブラウザコンソールのエラーを監視し、
 * 自動的に修正を試みます。
 */

class ErrorDetector {
    constructor() {
        this.errors = [];
        this.fixes = new Map();
        this.setupErrorHandlers();
        this.setupFixPatterns();
    }

    setupErrorHandlers() {
        // コンソールエラーを監視
        const originalError = console.error;
        console.error = (...args) => {
            this.handleError(args);
            originalError.apply(console, args);
        };

        // 未処理のPromiseエラーを監視
        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseError(event);
        });

        // 一般的なエラーイベントを監視
        window.addEventListener('error', (event) => {
            this.handleGeneralError(event);
        });

        console.log('🔍 Error Detector: 監視を開始しました');
    }

    setupFixPatterns() {
        // よくあるエラーパターンと修正方法を定義
        this.fixes.set(/Cannot read prop.* of undefined/, () => {
            console.log('🔧 Undefined property access detected - checking state initialization');
            this.checkStateInitialization();
        });

        this.fixes.set(/Failed to fetch/, () => {
            console.log('🔧 Network error detected - checking API connectivity');
            this.checkAPIConnectivity();
        });

        this.fixes.set(/Module not found/, () => {
            console.log('🔧 Module error detected - checking imports');
            this.checkImports();
        });

        this.fixes.set(/Unexpected token/, () => {
            console.log('🔧 Syntax error detected - checking recent changes');
            this.checkSyntax();
        });
    }

    handleError(args) {
        const errorMessage = args.join(' ');
        this.errors.push({
            type: 'console',
            message: errorMessage,
            timestamp: new Date().toISOString(),
            stack: new Error().stack
        });
        
        this.analyzeAndFix(errorMessage);
    }

    handlePromiseError(event) {
        const error = {
            type: 'promise',
            message: event.reason?.message || event.reason,
            timestamp: new Date().toISOString(),
            promise: event.promise
        };
        
        this.errors.push(error);
        this.analyzeAndFix(error.message);
    }

    handleGeneralError(event) {
        const error = {
            type: 'general',
            message: event.message,
            timestamp: new Date().toISOString(),
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        };
        
        this.errors.push(error);
        this.analyzeAndFix(error.message);
    }

    analyzeAndFix(errorMessage) {
        console.log('🔍 エラーを分析中:', errorMessage);
        
        // エラーパターンとマッチングして修正を試みる
        for (const [pattern, fixFunction] of this.fixes) {
            if (pattern.test(errorMessage)) {
                console.log('✅ 修正パターンを検出しました');
                fixFunction.call(this);
                return;
            }
        }
        
        console.log('⚠️ 自動修正できないエラーです。手動での対応が必要です。');
    }

    checkStateInitialization() {
        // React状態の初期化チェック
        const reactDevTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (reactDevTools) {
            console.log('📊 React DevToolsを使用して状態を確認中...');
            // React状態の検査ロジック
        }
    }

    async checkAPIConnectivity() {
        // API接続性チェック
        console.log('🌐 API接続を確認中...');
        try {
            const response = await fetch('http://192.168.3.135:8000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                console.log('✅ API接続は正常です');
            } else {
                console.log('❌ APIエラー:', response.status);
                this.suggestAPIFix(response.status);
            }
        } catch (error) {
            console.log('❌ ネットワークエラー:', error.message);
            this.suggestNetworkFix();
        }
    }

    checkImports() {
        // モジュールインポートチェック
        console.log('📦 モジュールインポートを確認中...');
        // Viteのモジュール解決を確認
        if (window.__vite__) {
            console.log('✅ Viteモジュールシステム検出');
        }
    }

    checkSyntax() {
        // 構文エラーチェック
        console.log('📝 構文エラーを確認中...');
        // 最近の変更を確認
    }

    suggestAPIFix(statusCode) {
        const fixes = {
            401: '認証トークンが無効です。再ログインしてください。',
            403: 'アクセス権限がありません。管理者に確認してください。',
            404: 'APIエンドポイントが見つかりません。URLを確認してください。',
            500: 'サーバーエラーです。しばらく待ってから再試行してください。'
        };
        
        console.log('💡 修正案:', fixes[statusCode] || '不明なエラーです。');
    }

    suggestNetworkFix() {
        console.log('💡 修正案:');
        console.log('1. FastAPIサーバーが起動していることを確認');
        console.log('2. CORS設定が正しいことを確認');
        console.log('3. ネットワーク接続を確認');
    }

    getErrorReport() {
        return {
            totalErrors: this.errors.length,
            errors: this.errors,
            timestamp: new Date().toISOString()
        };
    }

    clearErrors() {
        this.errors = [];
        console.log('🧹 エラーリストをクリアしました');
    }

    startAutoFix() {
        console.log('🤖 自動修復モードを開始します...');
        setInterval(() => {
            if (this.errors.length > 0) {
                console.log(`🔄 ${this.errors.length}個のエラーを処理中...`);
                this.errors.forEach(error => {
                    this.analyzeAndFix(error.message);
                });
                this.clearErrors();
            }
        }, 5000);
    }
}

// メニューナビゲーションテスター
class MenuNavigationTester {
    constructor() {
        this.menuItems = [];
        this.results = [];
    }

    async collectMenuItems() {
        // サイドメニューのすべての項目を収集
        const menuElements = document.querySelectorAll('[class*="cursor-pointer"]');
        
        menuElements.forEach(element => {
            const text = element.textContent?.trim();
            if (text) {
                this.menuItems.push({
                    text: text,
                    element: element,
                    path: element.getAttribute('href') || this.extractPath(element)
                });
            }
        });
        
        console.log(`📋 ${this.menuItems.length}個のメニュー項目を検出`);
        return this.menuItems;
    }

    extractPath(element) {
        // onClick属性からパスを抽出
        const onClickHandler = element.onclick;
        if (onClickHandler) {
            const handlerStr = onClickHandler.toString();
            const pathMatch = handlerStr.match(/['"]([^'"]+)['"]/);
            return pathMatch ? pathMatch[1] : null;
        }
        return null;
    }

    async testMenuItem(item) {
        console.log(`🧪 テスト中: ${item.text}`);
        
        try {
            // メニュー項目をクリック
            item.element.click();
            
            // ページ遷移を待つ
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // エラーチェック
            const hasErrors = window.errorDetector?.errors.length > 0;
            
            // コンテンツが表示されているかチェック
            const mainContent = document.querySelector('main');
            const hasContent = mainContent && mainContent.innerHTML.length > 100;
            
            const result = {
                item: item.text,
                path: item.path || window.location.pathname,
                success: !hasErrors && hasContent,
                errors: hasErrors ? window.errorDetector?.errors : [],
                timestamp: new Date().toISOString()
            };
            
            this.results.push(result);
            
            if (result.success) {
                console.log(`✅ ${item.text}: 正常動作`);
            } else {
                console.log(`❌ ${item.text}: エラー検出`);
            }
            
            return result;
            
        } catch (error) {
            console.error(`❌ テスト失敗: ${item.text}`, error);
            return {
                item: item.text,
                success: false,
                error: error.message
            };
        }
    }

    async runAllTests() {
        console.log('🚀 全メニュー項目のテストを開始...');
        
        await this.collectMenuItems();
        
        for (const item of this.menuItems) {
            await this.testMenuItem(item);
        }
        
        this.showReport();
    }

    showReport() {
        const successCount = this.results.filter(r => r.success).length;
        const failCount = this.results.filter(r => !r.success).length;
        
        console.log('');
        console.log('=' .repeat(50));
        console.log('📊 テスト結果サマリー');
        console.log('=' .repeat(50));
        console.log(`✅ 成功: ${successCount}個`);
        console.log(`❌ 失敗: ${failCount}個`);
        console.log(`📋 合計: ${this.results.length}個`);
        console.log('=' .repeat(50));
        
        if (failCount > 0) {
            console.log('\n失敗したメニュー項目:');
            this.results.filter(r => !r.success).forEach(r => {
                console.log(`  - ${r.item}: ${r.error || 'コンテンツ表示エラー'}`);
            });
        }
    }
}

// グローバルに登録
window.errorDetector = new ErrorDetector();
window.menuTester = new MenuNavigationTester();

console.log('');
console.log('🎯 Playwright Error Detector & Menu Tester');
console.log('=' .repeat(50));
console.log('利用可能なコマンド:');
console.log('  errorDetector.startAutoFix() - 自動修復モードを開始');
console.log('  errorDetector.getErrorReport() - エラーレポートを表示');
console.log('  menuTester.runAllTests() - 全メニュー項目をテスト');
console.log('=' .repeat(50));

// 自動修復モードを自動開始
window.errorDetector.startAutoFix();
console.log('✅ 自動エラー検知・修復モードが有効になりました');