/**
 * 設定管理統合モジュール
 * 
 * このモジュールは環境変数による設定の完全外部化を実現し、
 * どの環境でも.envファイル変更だけで動作するシステムを提供します。
 */

export { configManager, ConfigManager, ConfigError, type AppConfig } from './ConfigManager';
export { DatabaseConfig } from './DatabaseConfig';
export { ServerConfig } from './ServerConfig';
export { servicesConfig, ServicesConfig, ServiceConfigError } from './ServicesConfig';
export { environmentManager, EnvironmentManager, type EnvironmentType, type FeatureFlags } from './EnvironmentManager';

import { configManager } from './ConfigManager';
import { DatabaseConfig } from './DatabaseConfig';
import { ServerConfig } from './ServerConfig';
import { servicesConfig } from './ServicesConfig';
import { environmentManager } from './EnvironmentManager';

/**
 * アプリケーション初期化設定
 */
export class AppInitializer {
  private static initialized = false;

  /**
   * アプリケーション設定を初期化
   * 
   * この関数は以下の順序で初期化を実行します：
   * 1. 基本設定の読み込み
   * 2. 環境管理の初期化
   * 3. データベース接続の確立
   * 4. 外部サービスの初期化
   * 5. サーバー設定の準備
   */
  public static async initialize(): Promise<{
    config: any;
    database: any;
    server: ServerConfig;
    services: any;
    environment: any;
  }> {
    if (AppInitializer.initialized) {
      throw new Error('アプリケーションは既に初期化されています');
    }

    console.log('アプリケーションの初期化を開始します...');
    const startTime = Date.now();

    try {
      // 1. 基本設定の読み込み
      console.log('1. 基本設定を読み込んでいます...');
      const config = configManager.initialize();
      
      // 2. 環境管理の初期化
      console.log('2. 環境管理を初期化しています...');
      const environment = environmentManager;
      
      // 設定検証
      const validation = environment.validateConfiguration();
      if (!validation.isValid) {
        console.error('設定検証エラー:', validation.errors);
        throw new Error(`設定が無効です: ${validation.errors.join(', ')}`);
      }
      
      if (validation.warnings.length > 0) {
        console.warn('設定警告:', validation.warnings);
      }

      // 3. データベース接続の確立
      console.log('3. データベース接続を確立しています...');
      const database = await DatabaseConfig.initialize();
      
      // 4. 外部サービスの初期化
      console.log('4. 外部サービスを初期化しています...');
      await servicesConfig.initialize();
      
      // 5. サーバー設定の準備
      console.log('5. サーバー設定を準備しています...');
      const server = new ServerConfig();

      // 初期化完了
      AppInitializer.initialized = true;
      const initTime = Date.now() - startTime;
      
      console.log(`アプリケーションの初期化が完了しました (${initTime}ms)`);
      
      // 環境情報を表示
      if (config.app.debug) {
        environment.logEnvironmentInfo();
      }

      return {
        config,
        database,
        server,
        services: servicesConfig,
        environment,
      };

    } catch (error) {
      console.error('アプリケーションの初期化に失敗しました:', error);
      
      // 初期化に失敗した場合はクリーンアップを試行
      await AppInitializer.cleanup();
      
      throw error;
    }
  }

  /**
   * アプリケーションを起動
   */
  public static async start(options?: {
    skipServerStart?: boolean;
    customPort?: number;
    customHost?: string;
  }): Promise<{
    config: any;
    database: any;
    server: ServerConfig;
    services: any;
    environment: any;
  }> {
    const app = await AppInitializer.initialize();

    if (!options?.skipServerStart) {
      // カスタムポート/ホストが指定されている場合は環境変数を一時的に変更
      if (options?.customPort) {
        process.env.SERVER_PORT = options.customPort.toString();
      }
      if (options?.customHost) {
        process.env.SERVER_HOST = options.customHost;
      }

      console.log('サーバーを開始しています...');
      await app.server.start();
    }

    return app;
  }

  /**
   * クリーンアップ処理
   */
  public static async cleanup(): Promise<void> {
    console.log('クリーンアップ処理を開始します...');

    const cleanupPromises: Promise<void>[] = [];

    try {
      // データベース接続終了
      cleanupPromises.push(
        DatabaseConfig.close().catch(error => {
          console.warn('データベース接続終了エラー:', error);
        })
      );

      // 外部サービス終了
      cleanupPromises.push(
        servicesConfig.shutdown().catch(error => {
          console.warn('外部サービス終了エラー:', error);
        })
      );

      await Promise.all(cleanupPromises);
      
      AppInitializer.initialized = false;
      console.log('クリーンアップ処理が完了しました');
      
    } catch (error) {
      console.error('クリーンアップ処理でエラーが発生しました:', error);
    }
  }

  /**
   * グレースフルシャットダウン
   */
  public static async gracefulShutdown(server?: ServerConfig): Promise<void> {
    console.log('グレースフルシャットダウンを開始します...');
    const shutdownTimeout = environmentManager.isProduction() ? 30000 : 10000;

    const timeout = setTimeout(() => {
      console.log('シャットダウンがタイムアウトしました。強制終了します。');
      process.exit(1);
    }, shutdownTimeout);

    try {
      // サーバー停止
      if (server) {
        await server.stop();
      }

      // クリーンアップ
      await AppInitializer.cleanup();

      clearTimeout(timeout);
      console.log('グレースフルシャットダウンが完了しました');
      process.exit(0);

    } catch (error) {
      console.error('グレースフルシャットダウンエラー:', error);
      clearTimeout(timeout);
      process.exit(1);
    }
  }

  /**
   * ヘルスチェック
   */
  public static async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    uptime: number;
    environment: string;
    services: any;
  }> {
    if (!AppInitializer.initialized) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'unknown',
        services: {
          app: { status: 'unhealthy', message: 'アプリケーションが初期化されていません' }
        }
      };
    }

    const services: any = {};

    try {
      // データベースヘルスチェック
      const dbHealth = await DatabaseConfig.healthCheck();
      services.database = dbHealth;

      // 外部サービスヘルスチェック
      const servicesHealth = await servicesConfig.healthCheck();
      services.externalServices = servicesHealth;

      // 全体的な状態を判定
      const allServices = [
        services.database,
        services.externalServices,
      ];

      let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      
      for (const service of allServices) {
        if (service.status === 'unhealthy') {
          overallStatus = 'unhealthy';
          break;
        } else if (service.status === 'degraded' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }

      return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: environmentManager.getCurrentEnvironment(),
        services,
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: environmentManager.getCurrentEnvironment(),
        services: {
          error: {
            status: 'error',
            message: 'ヘルスチェック中にエラーが発生しました',
            error: error.message,
          }
        }
      };
    }
  }

  /**
   * システム情報を取得
   */
  public static getSystemInfo(): {
    application: any;
    environment: any;
    runtime: any;
    resources: any;
  } {
    const config = configManager.getConfig();
    
    return {
      application: {
        name: config.app.name,
        version: config.app.version,
        environment: config.app.env,
        debug: config.app.debug,
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        timezone: process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      runtime: {
        uptime: process.uptime(),
        pid: process.pid,
        ppid: process.ppid,
        title: process.title,
      },
      resources: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        cwd: process.cwd(),
      },
    };
  }

  /**
   * 設定情報を安全に取得（機密情報除外）
   */
  public static getSafeConfig(): any {
    const config = configManager.getConfig();
    
    // 機密情報を除外した設定を返す
    const safeConfig = JSON.parse(JSON.stringify(config));
    
    // パスワードやシークレット系を削除
    if (safeConfig.auth) {
      delete safeConfig.auth.jwtSecret;
      delete safeConfig.auth.sessionSecret;
      delete safeConfig.auth.csrfSecret;
      if (safeConfig.auth.oauth) {
        if (safeConfig.auth.oauth.google) {
          delete safeConfig.auth.oauth.google.clientSecret;
        }
        if (safeConfig.auth.oauth.microsoft) {
          delete safeConfig.auth.oauth.microsoft.clientSecret;
        }
      }
    }
    
    if (safeConfig.database) {
      delete safeConfig.database.password;
    }
    
    if (safeConfig.services?.email?.smtp) {
      delete safeConfig.services.email.smtp.pass;
    }
    
    if (safeConfig.services?.storage?.aws) {
      delete safeConfig.services.storage.aws.secretKey;
    }

    if (safeConfig.services?.redis) {
      delete safeConfig.services.redis.password;
    }
    
    return safeConfig;
  }

  /**
   * 初期化状態を取得
   */
  public static isInitialized(): boolean {
    return AppInitializer.initialized;
  }
}

// プロセス終了時のクリーンアップを設定
process.on('SIGTERM', async () => {
  await AppInitializer.gracefulShutdown();
});

process.on('SIGINT', async () => {
  await AppInitializer.gracefulShutdown();
});

process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await AppInitializer.cleanup();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await AppInitializer.cleanup();
  process.exit(1);
});

// デフォルトエクスポート
export default AppInitializer;