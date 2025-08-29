import { DataSource, DataSourceOptions } from 'typeorm';
import { configManager } from './ConfigManager';
import * as path from 'path';

/**
 * データベース接続設定
 */
export class DatabaseConfig {
  private static dataSource: DataSource | null = null;

  /**
   * TypeORM データソースオプションを生成
   */
  public static getDataSourceOptions(): DataSourceOptions {
    const config = configManager.getConfig();
    const dbConfig = config.database;

    // エンティティパスを動的に解決
    const entitiesPath = path.resolve(process.cwd(), 'src/entities/**/*.ts');
    const migrationPath = path.resolve(process.cwd(), dbConfig.migrations.directory, '**/*.ts');
    const subscribersPath = path.resolve(process.cwd(), 'src/subscribers/**/*.ts');

    const options: DataSourceOptions = {
      type: dbConfig.type as any,
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.name,
      schema: dbConfig.schema,
      
      // SSL設定
      ssl: dbConfig.ssl ? {
        rejectUnauthorized: dbConfig.sslRejectUnauthorized,
      } : false,

      // エンティティとマイグレーション
      entities: [entitiesPath],
      migrations: [migrationPath],
      subscribers: [subscribersPath],

      // 接続プール設定
      extra: {
        min: dbConfig.pool.min,
        max: dbConfig.pool.max,
        idleTimeoutMillis: dbConfig.pool.idleTimeout,
        acquireTimeoutMillis: dbConfig.pool.acquireTimeout,
        createTimeoutMillis: dbConfig.pool.createTimeout,
        destroyTimeoutMillis: dbConfig.pool.destroyTimeout,
      },

      // 開発環境でのみSQL文を出力
      logging: config.app.env === 'development' && config.app.debug,
      
      // 自動同期は開発環境のみ
      synchronize: config.app.env === 'development' && config.app.debug,
      
      // マイグレーション設定
      migrationsRun: dbConfig.migrations.run,
      migrationsTableName: dbConfig.migrations.table,

      // 接続タイムアウト
      connectTimeoutMS: 30000,
      
      // クエリタイムアウト
      acquireTimeoutMillis: dbConfig.pool.acquireTimeout,
    };

    // 環境別の追加設定
    if (config.app.env === 'production') {
      // 本番環境では追加のセキュリティ設定
      options.extra = {
        ...options.extra,
        ssl: dbConfig.ssl,
        // 接続プールの最適化
        statement_timeout: 30000,
        idle_in_transaction_session_timeout: 30000,
      };
    }

    return options;
  }

  /**
   * データソースを初期化
   */
  public static async initialize(): Promise<DataSource> {
    if (this.dataSource?.isInitialized) {
      return this.dataSource;
    }

    const options = this.getDataSourceOptions();
    this.dataSource = new DataSource(options);

    try {
      await this.dataSource.initialize();
      console.log('データベース接続が確立されました');
      
      // マイグレーション実行
      if (options.migrationsRun) {
        await this.runMigrations();
      }

      return this.dataSource;
    } catch (error) {
      console.error('データベース接続エラー:', error);
      throw new Error(`データベース接続に失敗しました: ${error.message}`);
    }
  }

  /**
   * マイグレーションを実行
   */
  private static async runMigrations(): Promise<void> {
    try {
      const pendingMigrations = await this.dataSource!.showMigrations();
      if (pendingMigrations) {
        console.log('保留中のマイグレーションを実行します...');
        await this.dataSource!.runMigrations();
        console.log('マイグレーションが完了しました');
      }
    } catch (error) {
      console.error('マイグレーション実行エラー:', error);
      throw error;
    }
  }

  /**
   * データソースを取得
   */
  public static getDataSource(): DataSource {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error('データベースが初期化されていません');
    }
    return this.dataSource;
  }

  /**
   * 接続を終了
   */
  public static async close(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      this.dataSource = null;
      console.log('データベース接続を終了しました');
    }
  }

  /**
   * ヘルスチェック
   */
  public static async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    details?: any;
  }> {
    try {
      if (!this.dataSource || !this.dataSource.isInitialized) {
        return {
          status: 'unhealthy',
          message: 'データベース接続が初期化されていません'
        };
      }

      // 簡単なクエリを実行してヘルスチェック
      await this.dataSource.query('SELECT 1');
      
      return {
        status: 'healthy',
        message: 'データベース接続は正常です',
        details: {
          host: this.dataSource.options.host,
          database: this.dataSource.options.database,
          isConnected: this.dataSource.isInitialized
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'データベースヘルスチェックに失敗しました',
        details: {
          error: error.message
        }
      };
    }
  }

  /**
   * 接続統計情報を取得
   */
  public static getConnectionStats(): any {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      return null;
    }

    const driver = this.dataSource.driver as any;
    const pool = driver.master || driver.pool;

    return {
      totalConnections: pool?.totalCount || 0,
      idleConnections: pool?.idleCount || 0,
      waitingClients: pool?.waitingCount || 0,
      maxConnections: pool?.options?.max || 0,
      minConnections: pool?.options?.min || 0,
    };
  }

  /**
   * データベースバックアップを実行
   */
  public static async createBackup(): Promise<string> {
    const config = configManager.getConfig();
    const dbConfig = config.database;
    
    if (!dbConfig.backup.enabled) {
      throw new Error('データベースバックアップが無効になっています');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `${dbConfig.name}_${timestamp}.sql`;
    const backupPath = path.resolve(dbConfig.backup.path, backupFileName);

    // バックアップコマンドを環境変数から構成
    const command = this.buildBackupCommand(backupPath);

    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      await execAsync(command);
      console.log(`データベースバックアップが作成されました: ${backupPath}`);
      
      // 古いバックアップファイルを削除
      await this.cleanOldBackups();
      
      return backupPath;
    } catch (error) {
      throw new Error(`バックアップの作成に失敗しました: ${error.message}`);
    }
  }

  /**
   * バックアップコマンドを構築
   */
  private static buildBackupCommand(backupPath: string): string {
    const config = configManager.getConfig();
    const dbConfig = config.database;

    // 環境変数でパスワードを設定
    const env = {
      PGPASSWORD: dbConfig.password,
    };

    switch (dbConfig.type) {
      case 'postgres':
      case 'postgresql':
        return `PGPASSWORD=${dbConfig.password} pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.name} > ${backupPath}`;
      
      case 'mysql':
      case 'mariadb':
        return `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.username} -p${dbConfig.password} ${dbConfig.name} > ${backupPath}`;
      
      default:
        throw new Error(`サポートされていないデータベースタイプ: ${dbConfig.type}`);
    }
  }

  /**
   * 古いバックアップファイルを削除
   */
  private static async cleanOldBackups(): Promise<void> {
    const config = configManager.getConfig();
    const dbConfig = config.database;
    
    const fs = require('fs').promises;
    const path = require('path');

    try {
      const files = await fs.readdir(dbConfig.backup.path);
      const backupFiles = files.filter(file => file.endsWith('.sql'));
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dbConfig.backup.retentionDays);

      for (const file of backupFiles) {
        const filePath = path.join(dbConfig.backup.path, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          console.log(`古いバックアップファイルを削除しました: ${file}`);
        }
      }
    } catch (error) {
      console.warn('バックアップファイルのクリーンアップに失敗しました:', error.message);
    }
  }

  /**
   * テスト用データベース設定
   */
  public static getTestDataSourceOptions(): DataSourceOptions {
    const config = configManager.getConfig();
    const baseOptions = this.getDataSourceOptions();

    return {
      ...baseOptions,
      database: process.env.TEST_DB_NAME || `${baseOptions.database}_test`,
      host: process.env.TEST_DB_HOST || baseOptions.host,
      port: parseInt(process.env.TEST_DB_PORT || baseOptions.port.toString()),
      synchronize: true, // テスト環境では同期を有効
      dropSchema: true,  // テスト開始時にスキーマをドロップ
      logging: false,    // テスト中はログを無効
    };
  }
}

// デフォルトエクスポート
export default DatabaseConfig;