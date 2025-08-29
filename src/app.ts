#!/usr/bin/env node

/**
 * ITサービス管理システム - メインアプリケーション
 * 
 * 環境変数による設定の完全外部化を実装
 * どの環境でも.envファイル変更だけで動作
 */

import AppInitializer from './config';

/**
 * メイン関数
 */
async function main() {
  try {
    console.log('='.repeat(50));
    console.log('IT Service Management System');
    console.log('環境変数による設定完全外部化システム');
    console.log('='.repeat(50));

    // アプリケーション初期化と起動
    const app = await AppInitializer.start();

    console.log('\n✅ アプリケーションが正常に起動しました');
    console.log('\n📊 システム情報:');
    const systemInfo = AppInitializer.getSystemInfo();
    console.log(`   アプリケーション: ${systemInfo.application.name} v${systemInfo.application.version}`);
    console.log(`   環境: ${systemInfo.application.environment}`);
    console.log(`   プラットフォーム: ${systemInfo.environment.platform} ${systemInfo.environment.arch}`);
    console.log(`   Node.js: ${systemInfo.environment.nodeVersion}`);
    console.log(`   プロセスID: ${systemInfo.runtime.pid}`);
    
    // 設定情報の表示（安全な情報のみ）
    if (app.config.app.debug) {
      console.log('\n🔧 設定情報:');
      const safeConfig = AppInitializer.getSafeConfig();
      console.log(`   サーバー: ${safeConfig.server.host}:${safeConfig.server.port}`);
      console.log(`   データベース: ${safeConfig.database.type}://${safeConfig.database.host}:${safeConfig.database.port}/${safeConfig.database.name}`);
      console.log(`   ストレージ: ${safeConfig.services.storage.type}`);
      console.log(`   キャッシュ: ${safeConfig.cache.type}`);
    }

    // ヘルスチェック実行
    console.log('\n🏥 ヘルスチェック実行中...');
    const healthCheck = await AppInitializer.healthCheck();
    console.log(`   ステータス: ${healthCheck.status === 'healthy' ? '✅ 正常' : healthCheck.status === 'degraded' ? '⚠️ 注意' : '❌ 異常'}`);
    console.log(`   稼働時間: ${Math.round(healthCheck.uptime)}秒`);

    // サービス状態の詳細表示
    if (app.config.app.debug && healthCheck.services) {
      console.log('\n🔍 サービス詳細:');
      Object.entries(healthCheck.services).forEach(([serviceName, service]: [string, any]) => {
        const status = service.status === 'healthy' ? '✅' : 
                      service.status === 'degraded' ? '⚠️' : '❌';
        console.log(`   ${serviceName}: ${status} ${service.message || ''}`);
      });
    }

    console.log('\n🚀 システムは正常に動作しています');
    console.log('終了するには Ctrl+C を押してください\n');

    // 定期的なヘルスチェック（開発環境のみ）
    if (app.environment.isDevelopment()) {
      setInterval(async () => {
        try {
          const health = await AppInitializer.healthCheck();
          if (health.status !== 'healthy') {
            console.warn(`⚠️ ヘルスチェック警告: ${health.status}`);
          }
        } catch (error) {
          console.error('定期ヘルスチェックエラー:', error.message);
        }
      }, 30000); // 30秒ごと
    }

  } catch (error) {
    console.error('\n❌ アプリケーションの起動に失敗しました:');
    console.error(error.message);
    
    if (error.stack && process.env.APP_DEBUG === 'true') {
      console.error('\nスタックトレース:');
      console.error(error.stack);
    }

    // 設定エラーの場合は詳細なヘルプを表示
    if (error.name === 'ConfigError') {
      console.error('\n💡 設定エラーの解決方法:');
      console.error('1. .env ファイルが存在することを確認してください');
      console.error('2. .env.example を参考に必要な環境変数を設定してください');
      console.error('3. データベース接続設定を確認してください');
      console.error('4. 必要なサービス（Redis、メールサーバーなど）が起動していることを確認してください');
    }

    // データベースエラーの場合
    if (error.message.includes('database') || error.message.includes('connection')) {
      console.error('\n💡 データベース接続エラーの解決方法:');
      console.error('1. データベースサーバーが起動していることを確認してください');
      console.error('2. DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD が正しく設定されていることを確認してください');
      console.error('3. データベースユーザーに適切な権限が設定されていることを確認してください');
    }

    // 終了処理
    await AppInitializer.cleanup();
    process.exit(1);
  }
}

// プロセス終了時のハンドリング
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM を受信しました。グレースフルシャットダウンを開始します...');
  await AppInitializer.gracefulShutdown();
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT を受信しました。グレースフルシャットダウンを開始します...');
  await AppInitializer.gracefulShutdown();
});

// 未処理の例外をキャッチ
process.on('uncaughtException', async (error) => {
  console.error('\n💥 未処理の例外が発生しました:', error);
  await AppInitializer.cleanup();
  process.exit(1);
});

// 未処理のPromise拒否をキャッチ
process.on('unhandledRejection', async (reason, promise) => {
  console.error('\n💥 未処理のPromise拒否が発生しました:');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  await AppInitializer.cleanup();
  process.exit(1);
});

// メイン関数を実行
if (require.main === module) {
  main().catch(async (error) => {
    console.error('メイン関数でエラーが発生しました:', error);
    await AppInitializer.cleanup();
    process.exit(1);
  });
}

export default main;