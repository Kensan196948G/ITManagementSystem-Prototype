import { configManager, AppConfig } from './ConfigManager';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 環境タイプ
 */
export type EnvironmentType = 'development' | 'production' | 'test' | 'staging';

/**
 * 機能フラグの状態
 */
export interface FeatureFlags {
  [key: string]: boolean | string | number;
}

/**
 * 環境別設定オーバーライド
 */
export interface EnvironmentOverrides {
  [key: string]: any;
}

/**
 * 環境管理クラス
 */
export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: AppConfig;
  private currentEnv: EnvironmentType;
  private featureFlags: FeatureFlags = {};
  private envOverrides: EnvironmentOverrides = {};

  private constructor() {
    this.config = configManager.getConfig();
    this.currentEnv = this.config.app.env as EnvironmentType;
    this.loadEnvironmentOverrides();
    this.loadFeatureFlags();
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  /**
   * 現在の環境を取得
   */
  public getCurrentEnvironment(): EnvironmentType {
    return this.currentEnv;
  }

  /**
   * 本番環境かどうかを判定
   */
  public isProduction(): boolean {
    return this.currentEnv === 'production';
  }

  /**
   * 開発環境かどうかを判定
   */
  public isDevelopment(): boolean {
    return this.currentEnv === 'development';
  }

  /**
   * テスト環境かどうかを判定
   */
  public isTest(): boolean {
    return this.currentEnv === 'test';
  }

  /**
   * ステージング環境かどうかを判定
   */
  public isStaging(): boolean {
    return this.currentEnv === 'staging';
  }

  /**
   * 環境別オーバーライド設定を読み込み
   */
  private loadEnvironmentOverrides(): void {
    const overrideFiles = [
      `.env.${this.currentEnv}.local`,
      `.env.${this.currentEnv}`,
      '.env.local',
    ];

    overrideFiles.forEach(fileName => {
      const filePath = path.resolve(process.cwd(), fileName);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const overrides = this.parseEnvFile(content);
          this.envOverrides = { ...this.envOverrides, ...overrides };
          console.log(`環境設定オーバーライドを読み込みました: ${fileName}`);
        } catch (error) {
          console.warn(`環境設定ファイルの読み込みに失敗しました: ${fileName}`, error);
        }
      }
    });
  }

  /**
   * .envファイルの内容を解析
   */
  private parseEnvFile(content: string): EnvironmentOverrides {
    const overrides: EnvironmentOverrides = {};
    const lines = content.split('\n');

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          overrides[key.trim()] = value;
        }
      }
    });

    return overrides;
  }

  /**
   * 機能フラグを読み込み
   */
  private loadFeatureFlags(): void {
    // 基本的な機能フラグを設定から取得
    this.featureFlags = {
      ...this.config.features,
      // 環境依存の機能フラグ
      debugMode: this.config.app.debug,
      devTools: this.isDevelopment(),
      sqlLogging: this.isDevelopment() && this.config.app.debug,
      hotReload: this.isDevelopment() && this.getEnvBoolean('DEV_HOT_RELOAD', true),
      sourceMaps: this.isDevelopment() && this.getEnvBoolean('DEV_SOURCE_MAPS', true),
      mockData: this.isDevelopment() && this.getEnvBoolean('DEV_MOCK_DATA', false),
      autoMigrate: this.isDevelopment() && this.getEnvBoolean('DEV_AUTO_MIGRATE', true),
      // 本番環境専用フラグ
      minify: this.isProduction() && this.getEnvBoolean('PROD_MINIFY', true),
      gzip: this.isProduction() && this.getEnvBoolean('PROD_GZIP', true),
      clusterMode: this.isProduction(),
      // テスト環境専用フラグ
      testParallel: this.isTest() && this.getEnvBoolean('TEST_PARALLEL', true),
    };

    // 動的機能フラグファイルの読み込み
    this.loadDynamicFeatureFlags();
  }

  /**
   * 動的機能フラグファイルを読み込み
   */
  private loadDynamicFeatureFlags(): void {
    const flagFiles = [
      `config/features.${this.currentEnv}.json`,
      'config/features.json',
    ];

    flagFiles.forEach(fileName => {
      const filePath = path.resolve(process.cwd(), fileName);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const dynamicFlags = JSON.parse(content);
          this.featureFlags = { ...this.featureFlags, ...dynamicFlags };
          console.log(`動的機能フラグを読み込みました: ${fileName}`);
        } catch (error) {
          console.warn(`機能フラグファイルの読み込みに失敗しました: ${fileName}`, error);
        }
      }
    });
  }

  /**
   * 機能フラグの値を取得
   */
  public getFeatureFlag<T = boolean>(key: string, defaultValue?: T): T {
    const value = this.featureFlags[key];
    if (value !== undefined) {
      return value as T;
    }
    return defaultValue as T;
  }

  /**
   * 機能フラグを設定
   */
  public setFeatureFlag(key: string, value: boolean | string | number): void {
    this.featureFlags[key] = value;
  }

  /**
   * 機能が有効かどうかを判定
   */
  public isFeatureEnabled(key: string): boolean {
    return this.getFeatureFlag(key, false) === true;
  }

  /**
   * 機能を有効化
   */
  public enableFeature(key: string): void {
    this.setFeatureFlag(key, true);
  }

  /**
   * 機能を無効化
   */
  public disableFeature(key: string): void {
    this.setFeatureFlag(key, false);
  }

  /**
   * 環境変数値を取得（オーバーライド対応）
   */
  public getEnvValue(key: string, defaultValue?: string): string | undefined {
    // オーバーライドから取得を試行
    if (this.envOverrides[key] !== undefined) {
      return this.envOverrides[key];
    }

    // 通常の環境変数から取得
    const value = process.env[key];
    if (value !== undefined) {
      return value;
    }

    return defaultValue;
  }

  /**
   * 環境変数からブール値を取得
   */
  public getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = this.getEnvValue(key);
    if (value === undefined) {
      return defaultValue;
    }
    return value.toLowerCase() === 'true';
  }

  /**
   * 環境変数から数値を取得
   */
  public getEnvNumber(key: string, defaultValue: number = 0): number {
    const value = this.getEnvValue(key);
    if (value === undefined) {
      return defaultValue;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * 環境変数からJSON値を取得
   */
  public getEnvJson<T = any>(key: string, defaultValue?: T): T {
    const value = this.getEnvValue(key);
    if (value === undefined) {
      return defaultValue as T;
    }
    
    try {
      return JSON.parse(value);
    } catch {
      console.warn(`環境変数 ${key} のJSON解析に失敗しました: ${value}`);
      return defaultValue as T;
    }
  }

  /**
   * 環境固有の設定を取得
   */
  public getEnvironmentConfig(): {
    database: any;
    server: any;
    logging: any;
    security: any;
    performance: any;
  } {
    const baseConfig = this.config;

    // 環境別の設定オーバーライド
    const envConfig = {
      database: this.getDatabaseConfig(),
      server: this.getServerConfig(),
      logging: this.getLoggingConfig(),
      security: this.getSecurityConfig(),
      performance: this.getPerformanceConfig(),
    };

    return envConfig;
  }

  /**
   * データベース環境設定
   */
  private getDatabaseConfig(): any {
    const baseDb = this.config.database;

    if (this.isProduction()) {
      return {
        ...baseDb,
        // 本番環境では接続プールを最適化
        pool: {
          ...baseDb.pool,
          min: this.getEnvNumber('PROD_DB_POOL_MIN', 10),
          max: this.getEnvNumber('PROD_DB_POOL_MAX', 50),
        },
        // SSL必須
        ssl: this.getEnvBoolean('DB_SSL', true),
        // 自動同期無効
        synchronize: false,
        // ログ無効
        logging: false,
      };
    }

    if (this.isTest()) {
      return {
        ...baseDb,
        // テスト用データベース名
        name: this.getEnvValue('TEST_DB_NAME', `${baseDb.name}_test`),
        // テスト用接続プール
        pool: {
          min: 1,
          max: 5,
          idleTimeout: 5000,
          acquireTimeout: 10000,
          createTimeout: 10000,
          destroyTimeout: 1000,
        },
        // 自動同期有効
        synchronize: true,
        dropSchema: true,
        // ログ無効
        logging: false,
      };
    }

    return baseDb;
  }

  /**
   * サーバー環境設定
   */
  private getServerConfig(): any {
    const baseServer = this.config.server;

    if (this.isProduction()) {
      return {
        ...baseServer,
        // HTTPS必須
        httpsEnabled: this.getEnvBoolean('SERVER_HTTPS_ENABLED', true),
        // タイムアウト短縮
        requestTimeout: this.getEnvNumber('SERVER_REQUEST_TIMEOUT', 15000),
        // クラスター化
        cluster: {
          enabled: this.getEnvBoolean('PROD_CLUSTER_ENABLED', true),
          workers: this.getEnvNumber('PROD_CLUSTER_WORKERS', 0), // 0 = CPU数
        },
      };
    }

    if (this.isDevelopment()) {
      return {
        ...baseServer,
        // ホットリロード設定
        hotReload: this.isFeatureEnabled('hotReload'),
        // CORS緩和
        corsOrigin: this.getEnvValue('SERVER_CORS_ORIGIN', '*'),
      };
    }

    return baseServer;
  }

  /**
   * ログ環境設定
   */
  private getLoggingConfig(): any {
    const baseLogging = this.config.logging;

    if (this.isProduction()) {
      return {
        ...baseLogging,
        level: this.getEnvValue('LOG_LEVEL', 'warn'),
        console: {
          enabled: this.getEnvBoolean('LOG_CONSOLE_ENABLED', false),
        },
        file: {
          ...baseLogging.file,
          enabled: true,
          maxSize: '50m',
          maxFiles: 30,
        },
      };
    }

    if (this.isDevelopment()) {
      return {
        ...baseLogging,
        level: this.getEnvValue('LOG_LEVEL', 'debug'),
        console: {
          enabled: true,
        },
        file: {
          ...baseLogging.file,
          enabled: this.getEnvBoolean('LOG_FILE_ENABLED', false),
        },
      };
    }

    return baseLogging;
  }

  /**
   * セキュリティ環境設定
   */
  private getSecurityConfig(): any {
    const baseSecurity = this.config.security;

    if (this.isProduction()) {
      return {
        ...baseSecurity,
        hsts: {
          enabled: true,
          maxAge: 31536000, // 1年
        },
        csp: true,
        xssProtection: true,
        frameOptions: 'DENY',
        contentTypeOptions: true,
      };
    }

    if (this.isDevelopment()) {
      return {
        ...baseSecurity,
        hsts: {
          enabled: false,
          maxAge: 0,
        },
        csp: false, // 開発時はCSPを緩和
      };
    }

    return baseSecurity;
  }

  /**
   * パフォーマンス環境設定
   */
  private getPerformanceConfig(): any {
    if (this.isProduction()) {
      return {
        minification: this.isFeatureEnabled('minify'),
        compression: this.isFeatureEnabled('gzip'),
        caching: {
          enabled: true,
          maxAge: '1y',
          etag: true,
        },
        cluster: {
          enabled: this.isFeatureEnabled('clusterMode'),
        },
      };
    }

    if (this.isDevelopment()) {
      return {
        minification: false,
        compression: false,
        sourceMaps: this.isFeatureEnabled('sourceMaps'),
        hotReload: this.isFeatureEnabled('hotReload'),
        caching: {
          enabled: false,
          maxAge: '0',
          etag: false,
        },
      };
    }

    return {};
  }

  /**
   * 環境情報を出力
   */
  public logEnvironmentInfo(): void {
    console.log('=== 環境情報 ===');
    console.log(`現在の環境: ${this.currentEnv}`);
    console.log(`デバッグモード: ${this.config.app.debug}`);
    console.log(`ログレベル: ${this.config.logging.level}`);
    
    console.log('\n=== 有効な機能フラグ ===');
    Object.entries(this.featureFlags)
      .filter(([, value]) => value === true)
      .forEach(([key]) => console.log(`✓ ${key}`));

    console.log('\n=== 無効な機能フラグ ===');
    Object.entries(this.featureFlags)
      .filter(([, value]) => value === false)
      .forEach(([key]) => console.log(`✗ ${key}`));

    if (Object.keys(this.envOverrides).length > 0) {
      console.log('\n=== 環境変数オーバーライド ===');
      Object.entries(this.envOverrides).forEach(([key, value]) => {
        // パスワードやシークレット系の値はマスク
        const maskedValue = this.shouldMaskValue(key) ? '***' : value;
        console.log(`${key}=${maskedValue}`);
      });
    }

    console.log('================\n');
  }

  /**
   * 値をマスクすべきかどうかを判定
   */
  private shouldMaskValue(key: string): boolean {
    const sensitiveKeys = [
      'password', 'secret', 'key', 'token', 'pass',
      'auth', 'credential', 'private'
    ];
    
    return sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive)
    );
  }

  /**
   * 設定をファイルにエクスポート
   */
  public exportConfig(filePath: string): void {
    const exportData = {
      environment: this.currentEnv,
      timestamp: new Date().toISOString(),
      config: this.getEnvironmentConfig(),
      featureFlags: this.featureFlags,
      // 機密情報は除外
    };

    try {
      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
      console.log(`設定をエクスポートしました: ${filePath}`);
    } catch (error) {
      console.error(`設定エクスポートに失敗しました: ${error.message}`);
    }
  }

  /**
   * 設定検証
   */
  public validateConfiguration(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 環境別の検証
    if (this.isProduction()) {
      // 本番環境の必須チェック
      if (!this.config.server.httpsEnabled) {
        warnings.push('本番環境ではHTTPS有効化を推奨します');
      }
      
      if (this.config.app.debug) {
        warnings.push('本番環境ではデバッグモードを無効にしてください');
      }

      if (this.config.auth.jwtSecret === 'your-super-secret-jwt-key-here') {
        errors.push('本番環境では JWT_SECRET を変更してください');
      }
    }

    // 機能フラグの整合性チェック
    if (this.isFeatureEnabled('emailVerification') && !this.config.notifications.email) {
      warnings.push('メール確認機能が有効ですが、メール通知が無効になっています');
    }

    // データベース設定チェック
    if (this.config.database.pool.max < this.config.database.pool.min) {
      errors.push('データベース接続プールの最大値が最小値より小さいです');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// シングルトンインスタンスをエクスポート
export const environmentManager = EnvironmentManager.getInstance();