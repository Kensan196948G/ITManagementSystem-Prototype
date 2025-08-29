import { configManager, AppConfig } from './ConfigManager';
import nodemailer from 'nodemailer';
import { createClient, RedisClientType } from 'redis';
import * as AWS from 'aws-sdk';
import * as path from 'path';
import * as fs from 'fs';

/**
 * サービス設定エラー
 */
export class ServiceConfigError extends Error {
  constructor(message: string, public readonly service: string) {
    super(message);
    this.name = 'ServiceConfigError';
  }
}

/**
 * 外部サービス設定クラス
 */
export class ServicesConfig {
  private static instance: ServicesConfig;
  private config: AppConfig;
  private redisClient: RedisClientType | null = null;
  private emailTransporter: nodemailer.Transporter | null = null;
  private awsS3: AWS.S3 | null = null;

  private constructor() {
    this.config = configManager.getConfig();
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): ServicesConfig {
    if (!ServicesConfig.instance) {
      ServicesConfig.instance = new ServicesConfig();
    }
    return ServicesConfig.instance;
  }

  /**
   * 全サービスを初期化
   */
  public async initialize(): Promise<void> {
    console.log('外部サービスを初期化しています...');

    const initPromises: Promise<void>[] = [];

    // Redis初期化（キャッシュまたはセッションで使用される場合）
    if (this.config.cache.type === 'redis' || this.config.session.store === 'redis') {
      initPromises.push(this.initializeRedis());
    }

    // メール初期化
    if (this.config.notifications.email) {
      initPromises.push(this.initializeEmail());
    }

    // AWS S3初期化（ストレージタイプがAWSの場合）
    if (this.config.services.storage.type === 'aws') {
      initPromises.push(this.initializeAWS());
    }

    try {
      await Promise.all(initPromises);
      console.log('外部サービスの初期化が完了しました');
    } catch (error) {
      console.error('外部サービスの初期化に失敗しました:', error);
      throw error;
    }
  }

  /**
   * Redis接続を初期化
   */
  private async initializeRedis(): Promise<void> {
    try {
      const redisConfig = this.config.services.redis;
      const url = configManager.getRedisUrl();

      this.redisClient = createClient({
        url,
        socket: {
          connectTimeout: redisConfig.timeout,
          lazyConnect: true,
        },
        retryDelayOnFailover: redisConfig.retryDelay,
        maxRetriesPerRequest: redisConfig.retryAttempts,
      });

      // エラーハンドリング
      this.redisClient.on('error', (error) => {
        console.error('Redis接続エラー:', error);
      });

      this.redisClient.on('connect', () => {
        console.log('Redis接続が確立されました');
      });

      this.redisClient.on('ready', () => {
        console.log('Redisが使用可能になりました');
      });

      this.redisClient.on('end', () => {
        console.log('Redis接続が終了しました');
      });

      // 接続開始
      await this.redisClient.connect();

      // 接続テスト
      await this.redisClient.ping();
      console.log('Redis接続テストに成功しました');

    } catch (error) {
      throw new ServiceConfigError(
        `Redis初期化に失敗しました: ${error.message}`,
        'redis'
      );
    }
  }

  /**
   * メールサービスを初期化
   */
  private async initializeEmail(): Promise<void> {
    try {
      const emailConfig = this.config.services.email.smtp;

      // SMTP設定の検証
      this.validateEmailConfig(emailConfig);

      // transporter作成
      this.emailTransporter = nodemailer.createTransporter({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.pass,
        },
        connectionTimeout: emailConfig.timeout,
        greetingTimeout: emailConfig.timeout,
        socketTimeout: emailConfig.timeout,
        // TLS設定
        tls: {
          rejectUnauthorized: this.config.app.env === 'production',
        },
        // デバッグログ
        debug: this.config.app.debug && this.config.app.env === 'development',
      });

      // 接続テスト
      await this.emailTransporter.verify();
      console.log('メールサーバー接続テストに成功しました');

    } catch (error) {
      throw new ServiceConfigError(
        `メールサービス初期化に失敗しました: ${error.message}`,
        'email'
      );
    }
  }

  /**
   * AWS S3を初期化
   */
  private async initializeAWS(): Promise<void> {
    try {
      const awsConfig = this.config.services.storage.aws!;

      // AWS設定の検証
      this.validateAWSConfig(awsConfig);

      // AWS設定
      AWS.config.update({
        accessKeyId: awsConfig.accessKey,
        secretAccessKey: awsConfig.secretKey,
        region: awsConfig.region,
      });

      // S3クライアント作成
      this.awsS3 = new AWS.S3({
        apiVersion: '2006-03-01',
        signatureVersion: 'v4',
        region: awsConfig.region,
        maxRetries: 3,
        retryDelayOptions: {
          customBackoff: (retryCount: number) => {
            return Math.pow(2, retryCount) * 100;
          },
        },
      });

      // 接続テスト（バケットの存在確認）
      await this.awsS3.headBucket({ Bucket: awsConfig.bucket }).promise();
      console.log('AWS S3接続テストに成功しました');

    } catch (error) {
      throw new ServiceConfigError(
        `AWS S3初期化に失敗しました: ${error.message}`,
        'aws-s3'
      );
    }
  }

  /**
   * Redis設定を検証
   */
  private validateEmailConfig(emailConfig: any): void {
    if (!emailConfig.host) {
      throw new ServiceConfigError('SMTP_HOST が設定されていません', 'email');
    }
    if (!emailConfig.user && this.config.app.env === 'production') {
      throw new ServiceConfigError('本番環境では SMTP_USER が必要です', 'email');
    }
    if (!emailConfig.pass && this.config.app.env === 'production') {
      throw new ServiceConfigError('本番環境では SMTP_PASS が必要です', 'email');
    }
  }

  /**
   * AWS設定を検証
   */
  private validateAWSConfig(awsConfig: any): void {
    if (!awsConfig.accessKey) {
      throw new ServiceConfigError('STORAGE_AWS_ACCESS_KEY が設定されていません', 'aws');
    }
    if (!awsConfig.secretKey) {
      throw new ServiceConfigError('STORAGE_AWS_SECRET_KEY が設定されていません', 'aws');
    }
    if (!awsConfig.bucket) {
      throw new ServiceConfigError('STORAGE_AWS_BUCKET が設定されていません', 'aws');
    }
  }

  /**
   * Redis接続を取得
   */
  public getRedisClient(): RedisClientType {
    if (!this.redisClient) {
      throw new ServiceConfigError('Redis接続が初期化されていません', 'redis');
    }
    return this.redisClient;
  }

  /**
   * メールトランスポーターを取得
   */
  public getEmailTransporter(): nodemailer.Transporter {
    if (!this.emailTransporter) {
      throw new ServiceConfigError('メールサービスが初期化されていません', 'email');
    }
    return this.emailTransporter;
  }

  /**
   * AWS S3クライアントを取得
   */
  public getS3Client(): AWS.S3 {
    if (!this.awsS3) {
      throw new ServiceConfigError('AWS S3が初期化されていません', 'aws-s3');
    }
    return this.awsS3;
  }

  /**
   * メール送信
   */
  public async sendEmail(options: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: any[];
  }): Promise<void> {
    const transporter = this.getEmailTransporter();
    const emailConfig = this.config.services.email.smtp;

    try {
      const result = await transporter.sendMail({
        from: emailConfig.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      });

      console.log('メール送信成功:', result.messageId);
    } catch (error) {
      console.error('メール送信エラー:', error);
      throw new ServiceConfigError(`メール送信に失敗しました: ${error.message}`, 'email');
    }
  }

  /**
   * ファイルアップロード（ストレージタイプに応じて処理）
   */
  public async uploadFile(
    file: Buffer | string,
    fileName: string,
    mimeType?: string
  ): Promise<{ url: string; path: string }> {
    const storageConfig = this.config.services.storage;

    if (storageConfig.type === 'local') {
      return this.uploadToLocal(file, fileName, mimeType);
    } else if (storageConfig.type === 'aws') {
      return this.uploadToS3(file, fileName, mimeType);
    } else {
      throw new ServiceConfigError(`サポートされていないストレージタイプ: ${storageConfig.type}`, 'storage');
    }
  }

  /**
   * ローカルストレージにアップロード
   */
  private async uploadToLocal(
    file: Buffer | string,
    fileName: string,
    mimeType?: string
  ): Promise<{ url: string; path: string }> {
    const storageConfig = this.config.services.storage.local!;
    const uploadPath = path.resolve(storageConfig.path);

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // ファイル名の重複を避けるためタイムスタンプを追加
    const timestamp = Date.now();
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    const uniqueFileName = `${baseName}_${timestamp}${ext}`;
    const filePath = path.join(uploadPath, uniqueFileName);

    try {
      if (typeof file === 'string') {
        fs.writeFileSync(filePath, file);
      } else {
        fs.writeFileSync(filePath, file);
      }

      const url = `/uploads/${uniqueFileName}`;
      return { url, path: filePath };
    } catch (error) {
      throw new ServiceConfigError(`ファイルアップロードに失敗しました: ${error.message}`, 'storage');
    }
  }

  /**
   * AWS S3にアップロード
   */
  private async uploadToS3(
    file: Buffer | string,
    fileName: string,
    mimeType?: string
  ): Promise<{ url: string; path: string }> {
    const s3Client = this.getS3Client();
    const awsConfig = this.config.services.storage.aws!;

    // ファイル名の重複を避けるためタイムスタンプを追加
    const timestamp = Date.now();
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    const uniqueFileName = `${baseName}_${timestamp}${ext}`;
    const key = `uploads/${uniqueFileName}`;

    const body = typeof file === 'string' ? Buffer.from(file) : file;

    try {
      const result = await s3Client.upload({
        Bucket: awsConfig.bucket,
        Key: key,
        Body: body,
        ContentType: mimeType || 'application/octet-stream',
        ACL: 'public-read',
      }).promise();

      return {
        url: result.Location,
        path: key,
      };
    } catch (error) {
      throw new ServiceConfigError(`S3アップロードに失敗しました: ${error.message}`, 'aws-s3');
    }
  }

  /**
   * キャッシュに値を設定
   */
  public async setCache(key: string, value: any, ttl?: number): Promise<void> {
    const cacheConfig = this.config.cache;

    if (cacheConfig.type === 'redis') {
      const client = this.getRedisClient();
      const prefixedKey = `${cacheConfig.redisPrefix}${key}`;
      const serializedValue = JSON.stringify(value);
      const cacheTtl = ttl || cacheConfig.ttl;

      await client.setEx(prefixedKey, cacheTtl, serializedValue);
    }
    // memory cache の実装は別途必要
  }

  /**
   * キャッシュから値を取得
   */
  public async getCache(key: string): Promise<any> {
    const cacheConfig = this.config.cache;

    if (cacheConfig.type === 'redis') {
      const client = this.getRedisClient();
      const prefixedKey = `${cacheConfig.redisPrefix}${key}`;
      const value = await client.get(prefixedKey);
      
      return value ? JSON.parse(value) : null;
    }
    // memory cache の実装は別途必要
    return null;
  }

  /**
   * キャッシュから値を削除
   */
  public async deleteCache(key: string): Promise<void> {
    const cacheConfig = this.config.cache;

    if (cacheConfig.type === 'redis') {
      const client = this.getRedisClient();
      const prefixedKey = `${cacheConfig.redisPrefix}${key}`;
      await client.del(prefixedKey);
    }
    // memory cache の実装は別途必要
  }

  /**
   * Webhook通知を送信
   */
  public async sendWebhookNotification(
    type: 'slack' | 'teams',
    message: string,
    options?: any
  ): Promise<void> {
    const notificationConfig = this.config.notifications;

    try {
      let webhookUrl: string | undefined;

      if (type === 'slack' && notificationConfig.slack) {
        webhookUrl = notificationConfig.slack;
      } else if (type === 'teams' && notificationConfig.teams) {
        webhookUrl = notificationConfig.teams;
      }

      if (!webhookUrl) {
        throw new ServiceConfigError(`${type.toUpperCase()}のWebhook URLが設定されていません`, type);
      }

      const payload = this.buildWebhookPayload(type, message, options);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`${type.toUpperCase()}通知送信成功`);
    } catch (error) {
      console.error(`${type.toUpperCase()}通知送信エラー:`, error);
      throw new ServiceConfigError(`${type.toUpperCase()}通知送信に失敗しました: ${error.message}`, type);
    }
  }

  /**
   * Webhookペイロードを構築
   */
  private buildWebhookPayload(type: 'slack' | 'teams', message: string, options?: any): any {
    if (type === 'slack') {
      return {
        text: message,
        username: options?.username || 'IT Management System',
        icon_emoji: options?.icon || ':robot_face:',
        channel: options?.channel,
        attachments: options?.attachments,
      };
    } else if (type === 'teams') {
      return {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: options?.summary || 'IT Management System通知',
        themeColor: options?.themeColor || '0078D4',
        sections: [
          {
            activityTitle: options?.title || 'システム通知',
            activitySubtitle: options?.subtitle || new Date().toISOString(),
            text: message,
          }
        ],
      };
    }
    
    return {};
  }

  /**
   * サービス全体のヘルスチェック
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    services: { [key: string]: any };
  }> {
    const services: { [key: string]: any } = {};
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    // Redis ヘルスチェック
    if (this.redisClient) {
      try {
        await this.redisClient.ping();
        services.redis = { status: 'healthy', message: 'Redis接続は正常です' };
      } catch (error) {
        services.redis = { status: 'unhealthy', message: 'Redis接続エラー', error: error.message };
        if (overallStatus === 'healthy') overallStatus = 'degraded';
      }
    }

    // メールサービス ヘルスチェック
    if (this.emailTransporter) {
      try {
        await this.emailTransporter.verify();
        services.email = { status: 'healthy', message: 'メールサービスは正常です' };
      } catch (error) {
        services.email = { status: 'unhealthy', message: 'メールサービスエラー', error: error.message };
        if (overallStatus === 'healthy') overallStatus = 'degraded';
      }
    }

    // AWS S3 ヘルスチェック
    if (this.awsS3) {
      try {
        const awsConfig = this.config.services.storage.aws!;
        await this.awsS3.headBucket({ Bucket: awsConfig.bucket }).promise();
        services.s3 = { status: 'healthy', message: 'AWS S3は正常です' };
      } catch (error) {
        services.s3 = { status: 'unhealthy', message: 'AWS S3エラー', error: error.message };
        if (overallStatus === 'healthy') overallStatus = 'degraded';
      }
    }

    return { status: overallStatus, services };
  }

  /**
   * 全サービスを終了
   */
  public async shutdown(): Promise<void> {
    console.log('外部サービスを終了しています...');

    const shutdownPromises: Promise<void>[] = [];

    // Redis接続終了
    if (this.redisClient) {
      shutdownPromises.push(
        this.redisClient.quit().then(() => {
          console.log('Redis接続を終了しました');
        })
      );
    }

    // メールトランスポーター終了
    if (this.emailTransporter) {
      shutdownPromises.push(
        new Promise<void>((resolve) => {
          this.emailTransporter!.close();
          console.log('メールサービスを終了しました');
          resolve();
        })
      );
    }

    await Promise.all(shutdownPromises);
    console.log('外部サービスの終了が完了しました');
  }
}

// シングルトンインスタンスをエクスポート
export const servicesConfig = ServicesConfig.getInstance();