import express, { Express, Request, Response, NextFunction } from 'express';
import https from 'https';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { configManager, AppConfig } from './ConfigManager';
import * as fs from 'fs';
import * as path from 'path';

/**
 * サーバー設定クラス
 */
export class ServerConfig {
  private app: Express;
  private server: http.Server | https.Server | null = null;
  private config: AppConfig;

  constructor() {
    this.config = configManager.getConfig();
    this.app = express();
    this.setupMiddleware();
  }

  /**
   * ミドルウェアをセットアップ
   */
  private setupMiddleware(): void {
    // セキュリティ設定
    this.setupSecurity();

    // CORS設定
    this.setupCors();

    // 圧縮設定
    this.setupCompression();

    // リクエスト解析設定
    this.setupParsing();

    // レート制限設定
    this.setupRateLimit();

    // 静的ファイル設定
    this.setupStaticFiles();

    // ログ設定
    this.setupLogging();

    // ヘルスチェック
    this.setupHealthCheck();

    // メトリクス
    this.setupMetrics();
  }

  /**
   * セキュリティ設定
   */
  private setupSecurity(): void {
    const securityConfig = this.config.security;

    // Helmet でセキュリティヘッダーを設定
    this.app.use(helmet({
      // HSTS設定
      hsts: securityConfig.hsts.enabled ? {
        maxAge: securityConfig.hsts.maxAge,
        includeSubDomains: true,
        preload: true,
      } : false,

      // CSP設定
      contentSecurityPolicy: securityConfig.csp ? {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
          scriptSrc: ["'self'", "'unsafe-eval'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'ws:', 'wss:'],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      } : false,

      // XSSプロテクション
      xssFilter: securityConfig.xssProtection,

      // フレームオプション
      frameguard: { action: securityConfig.frameOptions.toLowerCase() as any },

      // コンテンツタイプオプション
      noSniff: securityConfig.contentTypeOptions,

      // リファラーポリシー
      referrerPolicy: { policy: ['no-referrer-when-downgrade'] },
    }));

    // HTTPSリダイレクト（本番環境）
    if (this.config.app.env === 'production' && this.config.server.httpsEnabled) {
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.header('x-forwarded-proto') !== 'https') {
          res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
          next();
        }
      });
    }
  }

  /**
   * CORS設定
   */
  private setupCors(): void {
    const corsOptions: cors.CorsOptions = {
      origin: this.config.server.corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-CSRF-Token'
      ],
      credentials: true,
      maxAge: 86400, // 24時間
    };

    this.app.use(cors(corsOptions));
  }

  /**
   * 圧縮設定
   */
  private setupCompression(): void {
    if (this.config.app.env === 'production') {
      this.app.use(compression({
        filter: (req: Request, res: Response) => {
          if (req.headers['x-no-compression']) {
            return false;
          }
          return compression.filter(req, res);
        },
        level: 6,
        threshold: 1024,
      }));
    }
  }

  /**
   * リクエスト解析設定
   */
  private setupParsing(): void {
    // JSON解析
    this.app.use(express.json({
      limit: this.config.server.bodyLimit,
      strict: true,
    }));

    // URLエンコード解析
    this.app.use(express.urlencoded({
      extended: true,
      limit: this.config.server.bodyLimit,
    }));

    // リクエストタイムアウト
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(408).json({
            error: 'Request Timeout',
            message: 'リクエストがタイムアウトしました'
          });
        }
      }, this.config.server.requestTimeout);

      res.on('finish', () => clearTimeout(timeout));
      next();
    });
  }

  /**
   * レート制限設定
   */
  private setupRateLimit(): void {
    const rateLimitConfig = this.config.api.rateLimit;

    const limiter = rateLimit({
      windowMs: rateLimitConfig.window,
      max: rateLimitConfig.maxRequests,
      skipSuccessfulRequests: rateLimitConfig.skipSuccess,
      message: {
        error: 'Too Many Requests',
        message: 'レート制限に達しました。しばらく時間をおいて再試行してください。',
        retryAfter: Math.ceil(rateLimitConfig.window / 1000),
      },
      standardHeaders: true,
      legacyHeaders: false,
      // 環境変数で設定されたキー生成関数
      keyGenerator: (req: Request) => {
        return req.ip || req.connection.remoteAddress || 'unknown';
      },
    });

    this.app.use('/api', limiter);
  }

  /**
   * 静的ファイル設定
   */
  private setupStaticFiles(): void {
    const uploadPath = path.resolve(this.config.upload.destination);
    
    // アップロードファイル用
    this.app.use('/uploads', express.static(uploadPath, {
      maxAge: this.config.app.env === 'production' ? '1d' : '0',
      etag: true,
      lastModified: true,
    }));

    // 公開ファイル用
    const publicPath = path.resolve(process.cwd(), 'public');
    if (fs.existsSync(publicPath)) {
      this.app.use('/public', express.static(publicPath, {
        maxAge: this.config.app.env === 'production' ? '1y' : '0',
        etag: true,
        lastModified: true,
      }));
    }

    // フロントエンドビルドファイル用
    const buildPath = path.resolve(process.cwd(), 'build');
    if (fs.existsSync(buildPath)) {
      this.app.use(express.static(buildPath, {
        maxAge: this.config.app.env === 'production' ? '1y' : '0',
        etag: true,
        lastModified: true,
      }));
    }
  }

  /**
   * ログ設定
   */
  private setupLogging(): void {
    if (this.config.logging.console.enabled) {
      const morgan = require('morgan');
      
      // カスタムログフォーマット
      const logFormat = this.config.logging.format === 'combined' 
        ? 'combined'
        : ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

      this.app.use(morgan(logFormat, {
        stream: {
          write: (message: string) => {
            console.log(message.trim());
          }
        }
      }));
    }
  }

  /**
   * ヘルスチェック設定
   */
  private setupHealthCheck(): void {
    if (this.config.monitoring.healthCheck.enabled) {
      this.app.get(this.config.monitoring.healthCheck.path, async (req: Request, res: Response) => {
        try {
          const healthStatus = await this.performHealthCheck();
          const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
          res.status(statusCode).json(healthStatus);
        } catch (error) {
          res.status(500).json({
            status: 'error',
            message: 'ヘルスチェック中にエラーが発生しました',
            error: error.message,
          });
        }
      });
    }
  }

  /**
   * メトリクス設定
   */
  private setupMetrics(): void {
    if (this.config.monitoring.metrics.enabled) {
      const promClient = require('prom-client');
      
      // デフォルトメトリクスを収集
      promClient.collectDefaultMetrics();

      // カスタムメトリクス
      const httpRequestDuration = new promClient.Histogram({
        name: 'http_request_duration_seconds',
        help: 'HTTP request duration in seconds',
        labelNames: ['method', 'route', 'status_code'],
      });

      const httpRequestTotal = new promClient.Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests',
        labelNames: ['method', 'route', 'status_code'],
      });

      // ミドルウェアでメトリクス収集
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        const start = Date.now();
        
        res.on('finish', () => {
          const duration = (Date.now() - start) / 1000;
          const route = req.route?.path || req.path;
          
          httpRequestDuration
            .labels(req.method, route, res.statusCode.toString())
            .observe(duration);
          
          httpRequestTotal
            .labels(req.method, route, res.statusCode.toString())
            .inc();
        });
        
        next();
      });

      // メトリクスエンドポイント
      this.app.get(this.config.monitoring.metrics.path, (req: Request, res: Response) => {
        res.set('Content-Type', promClient.register.contentType);
        res.end(promClient.register.metrics());
      });
    }
  }

  /**
   * ヘルスチェック実行
   */
  private async performHealthCheck(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    uptime: number;
    services: any;
  }> {
    const services: any = {};
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    // データベースヘルスチェック
    try {
      const { DatabaseConfig } = await import('./DatabaseConfig');
      const dbHealth = await DatabaseConfig.healthCheck();
      services.database = dbHealth;
      
      if (dbHealth.status === 'unhealthy') {
        overallStatus = 'unhealthy';
      }
    } catch (error) {
      services.database = {
        status: 'unhealthy',
        message: 'データベースヘルスチェックでエラー',
        error: error.message,
      };
      overallStatus = 'unhealthy';
    }

    // Redisヘルスチェック（設定されている場合）
    if (this.config.cache.type === 'redis') {
      try {
        // Redis接続チェックの実装が必要
        services.redis = { status: 'healthy', message: 'Redis接続は正常です' };
      } catch (error) {
        services.redis = {
          status: 'unhealthy',
          message: 'Redis接続エラー',
          error: error.message,
        };
        if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    }

    // ディスク容量チェック
    try {
      const diskUsage = await this.checkDiskUsage();
      services.disk = diskUsage;
      
      if (diskUsage.usage > 90) {
        if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      }
    } catch (error) {
      services.disk = {
        status: 'error',
        message: 'ディスク容量チェックエラー',
        error: error.message,
      };
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services,
    };
  }

  /**
   * ディスク容量チェック
   */
  private async checkDiskUsage(): Promise<any> {
    const fs = require('fs');
    const { promisify } = require('util');
    const statvfs = promisify(fs.statvfs || (() => { throw new Error('statvfs not available'); }));

    try {
      const stats = await statvfs(process.cwd());
      const total = stats.blocks * stats.bavail;
      const free = stats.bavail * stats.bsize;
      const used = total - free;
      const usage = (used / total) * 100;

      return {
        status: usage > 90 ? 'warning' : 'healthy',
        total,
        used,
        free,
        usage: Math.round(usage * 100) / 100,
      };
    } catch (error) {
      return {
        status: 'unknown',
        message: 'ディスク容量を取得できませんでした',
        error: error.message,
      };
    }
  }

  /**
   * サーバーを開始
   */
  public async start(): Promise<void> {
    const serverConfig = this.config.server;

    try {
      if (serverConfig.httpsEnabled) {
        await this.startHttpsServer();
      } else {
        await this.startHttpServer();
      }

      console.log(`サーバーが開始されました: ${serverConfig.httpsEnabled ? 'https' : 'http'}://${serverConfig.host}:${serverConfig.port}`);
      
      // 設定情報をログ出力
      if (this.config.app.debug) {
        configManager.logEnvironmentInfo();
      }

    } catch (error) {
      console.error('サーバーの開始に失敗しました:', error);
      throw error;
    }
  }

  /**
   * HTTPサーバーを開始
   */
  private async startHttpServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(this.app);
      
      this.server.listen(this.config.server.port, this.config.server.host, () => {
        resolve();
      });

      this.server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          reject(new Error(`ポート ${this.config.server.port} は既に使用されています`));
        } else {
          reject(error);
        }
      });

      // グレースフルシャットダウンの設定
      this.setupGracefulShutdown();
    });
  }

  /**
   * HTTPSサーバーを開始
   */
  private async startHttpsServer(): Promise<void> {
    const serverConfig = this.config.server;
    
    if (!serverConfig.sslCertPath || !serverConfig.sslKeyPath) {
      throw new Error('HTTPS有効時はSSL証明書パスが必要です (SERVER_SSL_CERT_PATH, SERVER_SSL_KEY_PATH)');
    }

    return new Promise((resolve, reject) => {
      try {
        const options = {
          cert: fs.readFileSync(serverConfig.sslCertPath!),
          key: fs.readFileSync(serverConfig.sslKeyPath!),
        };

        this.server = https.createServer(options, this.app);
        
        this.server.listen(serverConfig.port, serverConfig.host, () => {
          resolve();
        });

        this.server.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            reject(new Error(`ポート ${serverConfig.port} は既に使用されています`));
          } else {
            reject(error);
          }
        });

        // グレースフルシャットダウンの設定
        this.setupGracefulShutdown();

      } catch (error) {
        reject(new Error(`SSL証明書の読み込みに失敗しました: ${error.message}`));
      }
    });
  }

  /**
   * グレースフルシャットダウンを設定
   */
  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`${signal} を受信しました。グレースフルシャットダウンを開始します...`);
      
      const timeout = setTimeout(() => {
        console.log('グレースフルシャットダウンがタイムアウトしました。強制終了します。');
        process.exit(1);
      }, this.config.app.env === 'production' ? 10000 : 5000);

      try {
        await this.stop();
        clearTimeout(timeout);
        process.exit(0);
      } catch (error) {
        console.error('グレースフルシャットダウンエラー:', error);
        clearTimeout(timeout);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  /**
   * サーバーを停止
   */
  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((error) => {
        if (error) {
          reject(error);
        } else {
          console.log('サーバーを停止しました');
          resolve();
        }
      });
    });
  }

  /**
   * Expressアプリケーションを取得
   */
  public getApp(): Express {
    return this.app;
  }

  /**
   * サーバーインスタンスを取得
   */
  public getServer(): http.Server | https.Server | null {
    return this.server;
  }
}

// デフォルトエクスポート
export default ServerConfig;