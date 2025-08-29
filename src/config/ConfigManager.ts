import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 環境設定エラー
 */
export class ConfigError extends Error {
  constructor(message: string, public readonly key?: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * 設定値の型定義
 */
export interface AppConfig {
  // アプリケーション基本設定
  app: {
    name: string;
    version: string;
    env: 'development' | 'production' | 'test';
    debug: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
  };

  // サーバー設定
  server: {
    host: string;
    port: number;
    httpsEnabled: boolean;
    sslCertPath?: string;
    sslKeyPath?: string;
    corsOrigin: string | string[];
    bodyLimit: string;
    requestTimeout: number;
  };

  // データベース設定
  database: {
    type: string;
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    schema: string;
    ssl: boolean;
    sslRejectUnauthorized: boolean;
    pool: {
      min: number;
      max: number;
      idleTimeout: number;
      acquireTimeout: number;
      createTimeout: number;
      destroyTimeout: number;
    };
    migrations: {
      run: boolean;
      table: string;
      directory: string;
    };
    backup: {
      enabled: boolean;
      schedule: string;
      retentionDays: number;
      path: string;
    };
  };

  // 認証・セキュリティ設定
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshExpiresIn: string;
    bcryptRounds: number;
    sessionSecret: string;
    csrfSecret: string;
    oauth: {
      google: {
        clientId?: string;
        clientSecret?: string;
      };
      microsoft: {
        clientId?: string;
        clientSecret?: string;
      };
    };
  };

  // 外部サービス設定
  services: {
    email: {
      smtp: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
        from: string;
        timeout: number;
      };
    };
    storage: {
      type: 'local' | 'aws';
      local?: {
        path: string;
      };
      aws?: {
        region: string;
        bucket: string;
        accessKey: string;
        secretKey: string;
      };
    };
    redis: {
      host: string;
      port: number;
      password?: string;
      db: number;
      timeout: number;
      retryDelay: number;
      retryAttempts: number;
    };
  };

  // API設定
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    rateLimit: {
      window: number;
      maxRequests: number;
      skipSuccess: boolean;
    };
  };

  // ログ設定
  logging: {
    level: string;
    format: string;
    file: {
      enabled: boolean;
      path: string;
      maxSize: string;
      maxFiles: number;
    };
    console: {
      enabled: boolean;
    };
    errorFile: string;
  };

  // 監視・メトリクス設定
  monitoring: {
    metrics: {
      enabled: boolean;
      port: number;
      path: string;
    };
    healthCheck: {
      enabled: boolean;
      path: string;
    };
  };

  // 機能フラグ設定
  features: {
    userRegistration: boolean;
    emailVerification: boolean;
    twoFactorAuth: boolean;
    auditLog: boolean;
    notifications: boolean;
    analytics: boolean;
    autoBackup: boolean;
  };

  // キャッシュ設定
  cache: {
    type: 'memory' | 'redis';
    ttl: number;
    maxSize: number;
    redisPrefix: string;
  };

  // セッション設定
  session: {
    store: 'memory' | 'redis';
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };

  // ファイルアップロード設定
  upload: {
    maxSize: number;
    allowedTypes: string[];
    destination: string;
    tempDir: string;
  };

  // 通知設定
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    slack?: string;
    teams?: string;
  };

  // セキュリティ設定
  security: {
    hsts: {
      enabled: boolean;
      maxAge: number;
    };
    csp: boolean;
    xssProtection: boolean;
    frameOptions: string;
    contentTypeOptions: boolean;
  };
}

/**
 * 設定管理クラス
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig | null = null;
  private envPath: string;

  private constructor() {
    // 環境に応じた.envファイルのパスを決定
    const env = process.env.NODE_ENV || 'development';
    this.envPath = path.resolve(process.cwd(), `.env.${env}`);
    
    // 環境別ファイルが存在しない場合は.envを使用
    if (!fs.existsSync(this.envPath)) {
      this.envPath = path.resolve(process.cwd(), '.env');
    }
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 設定を初期化
   */
  public initialize(): AppConfig {
    // 環境変数を読み込み
    dotenv.config({ path: this.envPath });

    try {
      this.config = this.parseConfig();
      this.validateConfig();
      return this.config;
    } catch (error) {
      if (error instanceof ConfigError) {
        throw error;
      }
      throw new ConfigError(`設定の初期化に失敗しました: ${error.message}`);
    }
  }

  /**
   * 設定値を取得
   */
  public getConfig(): AppConfig {
    if (!this.config) {
      throw new ConfigError('設定が初期化されていません。initialize()を先に呼び出してください。');
    }
    return this.config;
  }

  /**
   * 特定の設定値を取得
   */
  public get<T extends keyof AppConfig>(key: T): AppConfig[T] {
    return this.getConfig()[key];
  }

  /**
   * 環境変数から設定を解析
   */
  private parseConfig(): AppConfig {
    return {
      app: {
        name: this.getEnvString('APP_NAME', 'IT Management System'),
        version: this.getEnvString('APP_VERSION', '1.0.0'),
        env: this.getEnvString('NODE_ENV', 'development') as any,
        debug: this.getEnvBoolean('APP_DEBUG', true),
        logLevel: this.getEnvString('APP_LOG_LEVEL', 'info') as any,
      },

      server: {
        host: this.getEnvString('SERVER_HOST', 'localhost'),
        port: this.getEnvNumber('SERVER_PORT', 3000),
        httpsEnabled: this.getEnvBoolean('SERVER_HTTPS_ENABLED', false),
        sslCertPath: this.getEnvString('SERVER_SSL_CERT_PATH'),
        sslKeyPath: this.getEnvString('SERVER_SSL_KEY_PATH'),
        corsOrigin: this.parseCorsOrigin(this.getEnvString('SERVER_CORS_ORIGIN', '*')),
        bodyLimit: this.getEnvString('SERVER_BODY_LIMIT', '50mb'),
        requestTimeout: this.getEnvNumber('SERVER_REQUEST_TIMEOUT', 30000),
      },

      database: {
        type: this.getEnvString('DB_TYPE', 'postgresql'),
        host: this.getEnvString('DB_HOST', 'localhost'),
        port: this.getEnvNumber('DB_PORT', 5432),
        name: this.getEnvString('DB_NAME', 'itsm_dev'),
        username: this.getEnvString('DB_USERNAME', 'postgres'),
        password: this.getEnvString('DB_PASSWORD', 'password'),
        schema: this.getEnvString('DB_SCHEMA', 'public'),
        ssl: this.getEnvBoolean('DB_SSL', false),
        sslRejectUnauthorized: this.getEnvBoolean('DB_SSL_REJECT_UNAUTHORIZED', false),
        pool: {
          min: this.getEnvNumber('DB_POOL_MIN', 2),
          max: this.getEnvNumber('DB_POOL_MAX', 20),
          idleTimeout: this.getEnvNumber('DB_POOL_IDLE_TIMEOUT', 10000),
          acquireTimeout: this.getEnvNumber('DB_POOL_ACQUIRE_TIMEOUT', 30000),
          createTimeout: this.getEnvNumber('DB_POOL_CREATE_TIMEOUT', 30000),
          destroyTimeout: this.getEnvNumber('DB_POOL_DESTROY_TIMEOUT', 5000),
        },
        migrations: {
          run: this.getEnvBoolean('DB_MIGRATIONS_RUN', true),
          table: this.getEnvString('DB_MIGRATIONS_TABLE', 'migrations'),
          directory: this.getEnvString('DB_MIGRATIONS_DIR', './src/database/migrations'),
        },
        backup: {
          enabled: this.getEnvBoolean('DB_BACKUP_ENABLED', true),
          schedule: this.getEnvString('DB_BACKUP_SCHEDULE', '0 2 * * *'),
          retentionDays: this.getEnvNumber('DB_BACKUP_RETENTION_DAYS', 30),
          path: this.getEnvString('DB_BACKUP_PATH', './backups'),
        },
      },

      auth: {
        jwtSecret: this.getEnvStringRequired('JWT_SECRET'),
        jwtExpiresIn: this.getEnvString('JWT_EXPIRES_IN', '24h'),
        jwtRefreshExpiresIn: this.getEnvString('JWT_REFRESH_EXPIRES_IN', '7d'),
        bcryptRounds: this.getEnvNumber('BCRYPT_ROUNDS', 12),
        sessionSecret: this.getEnvStringRequired('SESSION_SECRET'),
        csrfSecret: this.getEnvStringRequired('CSRF_SECRET'),
        oauth: {
          google: {
            clientId: this.getEnvString('OAUTH_GOOGLE_CLIENT_ID'),
            clientSecret: this.getEnvString('OAUTH_GOOGLE_CLIENT_SECRET'),
          },
          microsoft: {
            clientId: this.getEnvString('OAUTH_MICROSOFT_CLIENT_ID'),
            clientSecret: this.getEnvString('OAUTH_MICROSOFT_CLIENT_SECRET'),
          },
        },
      },

      services: {
        email: {
          smtp: {
            host: this.getEnvString('SMTP_HOST', 'smtp.gmail.com'),
            port: this.getEnvNumber('SMTP_PORT', 587),
            secure: this.getEnvBoolean('SMTP_SECURE', false),
            user: this.getEnvString('SMTP_USER', ''),
            pass: this.getEnvString('SMTP_PASS', ''),
            from: this.getEnvString('SMTP_FROM', 'IT Management System <noreply@yourcompany.com>'),
            timeout: this.getEnvNumber('EMAIL_TIMEOUT', 10000),
          },
        },
        storage: {
          type: this.getEnvString('STORAGE_TYPE', 'local') as any,
          local: {
            path: this.getEnvString('STORAGE_LOCAL_PATH', './uploads'),
          },
          aws: {
            region: this.getEnvString('STORAGE_AWS_REGION', 'us-east-1'),
            bucket: this.getEnvString('STORAGE_AWS_BUCKET', ''),
            accessKey: this.getEnvString('STORAGE_AWS_ACCESS_KEY', ''),
            secretKey: this.getEnvString('STORAGE_AWS_SECRET_KEY', ''),
          },
        },
        redis: {
          host: this.getEnvString('REDIS_HOST', 'localhost'),
          port: this.getEnvNumber('REDIS_PORT', 6379),
          password: this.getEnvString('REDIS_PASSWORD'),
          db: this.getEnvNumber('REDIS_DB', 0),
          timeout: this.getEnvNumber('REDIS_TIMEOUT', 5000),
          retryDelay: this.getEnvNumber('REDIS_RETRY_DELAY', 100),
          retryAttempts: this.getEnvNumber('REDIS_RETRY_ATTEMPTS', 3),
        },
      },

      api: {
        baseUrl: this.getEnvString('API_BASE_URL', 'http://localhost:3000/api'),
        timeout: this.getEnvNumber('API_TIMEOUT', 15000),
        retryAttempts: this.getEnvNumber('API_RETRY_ATTEMPTS', 3),
        retryDelay: this.getEnvNumber('API_RETRY_DELAY', 1000),
        rateLimit: {
          window: this.getEnvNumber('RATE_LIMIT_WINDOW', 900000),
          maxRequests: this.getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
          skipSuccess: this.getEnvBoolean('RATE_LIMIT_SKIP_SUCCESS', false),
        },
      },

      logging: {
        level: this.getEnvString('LOG_LEVEL', 'info'),
        format: this.getEnvString('LOG_FORMAT', 'combined'),
        file: {
          enabled: this.getEnvBoolean('LOG_FILE_ENABLED', true),
          path: this.getEnvString('LOG_FILE_PATH', './logs/app.log'),
          maxSize: this.getEnvString('LOG_FILE_MAX_SIZE', '10m'),
          maxFiles: this.getEnvNumber('LOG_FILE_MAX_FILES', 14),
        },
        console: {
          enabled: this.getEnvBoolean('LOG_CONSOLE_ENABLED', true),
        },
        errorFile: this.getEnvString('LOG_ERROR_FILE', './logs/error.log'),
      },

      monitoring: {
        metrics: {
          enabled: this.getEnvBoolean('METRICS_ENABLED', true),
          port: this.getEnvNumber('METRICS_PORT', 9090),
          path: this.getEnvString('METRICS_PATH', '/metrics'),
        },
        healthCheck: {
          enabled: this.getEnvBoolean('HEALTH_CHECK_ENABLED', true),
          path: this.getEnvString('HEALTH_CHECK_PATH', '/health'),
        },
      },

      features: {
        userRegistration: this.getEnvBoolean('FEATURE_USER_REGISTRATION', true),
        emailVerification: this.getEnvBoolean('FEATURE_EMAIL_VERIFICATION', true),
        twoFactorAuth: this.getEnvBoolean('FEATURE_TWO_FACTOR_AUTH', false),
        auditLog: this.getEnvBoolean('FEATURE_AUDIT_LOG', true),
        notifications: this.getEnvBoolean('FEATURE_NOTIFICATIONS', true),
        analytics: this.getEnvBoolean('FEATURE_ANALYTICS', true),
        autoBackup: this.getEnvBoolean('FEATURE_AUTO_BACKUP', true),
      },

      cache: {
        type: this.getEnvString('CACHE_TYPE', 'memory') as any,
        ttl: this.getEnvNumber('CACHE_TTL', 3600),
        maxSize: this.getEnvNumber('CACHE_MAX_SIZE', 100),
        redisPrefix: this.getEnvString('CACHE_REDIS_PREFIX', 'itsm:'),
      },

      session: {
        store: this.getEnvString('SESSION_STORE', 'memory') as any,
        maxAge: this.getEnvNumber('SESSION_MAX_AGE', 86400000),
        secure: this.getEnvBoolean('SESSION_SECURE', false),
        httpOnly: this.getEnvBoolean('SESSION_HTTP_ONLY', true),
        sameSite: this.getEnvString('SESSION_SAME_SITE', 'lax') as any,
      },

      upload: {
        maxSize: this.getEnvNumber('UPLOAD_MAX_SIZE', 10485760),
        allowedTypes: this.getEnvString('UPLOAD_ALLOWED_TYPES', 'jpg,jpeg,png,pdf,doc,docx,xls,xlsx').split(','),
        destination: this.getEnvString('UPLOAD_DESTINATION', './uploads'),
        tempDir: this.getEnvString('UPLOAD_TEMP_DIR', './temp'),
      },

      notifications: {
        email: this.getEnvBoolean('NOTIFICATION_EMAIL_ENABLED', true),
        sms: this.getEnvBoolean('NOTIFICATION_SMS_ENABLED', false),
        push: this.getEnvBoolean('NOTIFICATION_PUSH_ENABLED', true),
        slack: this.getEnvString('NOTIFICATION_SLACK_WEBHOOK'),
        teams: this.getEnvString('NOTIFICATION_TEAMS_WEBHOOK'),
      },

      security: {
        hsts: {
          enabled: this.getEnvBoolean('SECURITY_HSTS_ENABLED', true),
          maxAge: this.getEnvNumber('SECURITY_HSTS_MAX_AGE', 31536000),
        },
        csp: this.getEnvBoolean('SECURITY_CSP_ENABLED', true),
        xssProtection: this.getEnvBoolean('SECURITY_XSS_PROTECTION', true),
        frameOptions: this.getEnvString('SECURITY_FRAME_OPTIONS', 'DENY'),
        contentTypeOptions: this.getEnvBoolean('SECURITY_CONTENT_TYPE_OPTIONS', true),
      },
    };
  }

  /**
   * 設定を検証
   */
  private validateConfig(): void {
    const config = this.config!;

    // 必須設定の検証
    this.validateRequired(config.auth.jwtSecret, 'JWT_SECRET');
    this.validateRequired(config.auth.sessionSecret, 'SESSION_SECRET');
    this.validateRequired(config.auth.csrfSecret, 'CSRF_SECRET');

    // ポート番号の検証
    this.validatePort(config.server.port, 'SERVER_PORT');
    this.validatePort(config.database.port, 'DB_PORT');

    // SSL設定の検証
    if (config.server.httpsEnabled) {
      this.validateRequired(config.server.sslCertPath, 'SERVER_SSL_CERT_PATH');
      this.validateRequired(config.server.sslKeyPath, 'SERVER_SSL_KEY_PATH');
      this.validateFileExists(config.server.sslCertPath!, 'SERVER_SSL_CERT_PATH');
      this.validateFileExists(config.server.sslKeyPath!, 'SERVER_SSL_KEY_PATH');
    }

    // 環境別設定の検証
    if (config.app.env === 'production') {
      this.validateProductionConfig(config);
    }

    // ディレクトリパスの検証
    this.validateDirectoryPaths(config);
  }

  /**
   * 本番環境設定を検証
   */
  private validateProductionConfig(config: AppConfig): void {
    // 本番環境では安全な設定が必要
    if (config.auth.jwtSecret === 'your-super-secret-jwt-key-here') {
      throw new ConfigError('本番環境では JWT_SECRET を安全な値に変更してください', 'JWT_SECRET');
    }

    if (config.server.httpsEnabled === false) {
      console.warn('警告: 本番環境ではHTTPS有効化を推奨します (SERVER_HTTPS_ENABLED=true)');
    }

    if (config.app.debug === true) {
      console.warn('警告: 本番環境ではデバッグモードを無効にしてください (APP_DEBUG=false)');
    }
  }

  /**
   * ディレクトリパスを検証し、必要に応じて作成
   */
  private validateDirectoryPaths(config: AppConfig): void {
    const paths = [
      config.upload.destination,
      config.upload.tempDir,
      path.dirname(config.logging.file.path),
      path.dirname(config.logging.errorFile),
      config.database.backup.path,
    ];

    paths.forEach(dirPath => {
      if (dirPath && !fs.existsSync(dirPath)) {
        try {
          fs.mkdirSync(dirPath, { recursive: true });
        } catch (error) {
          throw new ConfigError(`ディレクトリの作成に失敗しました: ${dirPath}`);
        }
      }
    });
  }

  /**
   * 環境変数から文字列値を取得
   */
  private getEnvString(key: string, defaultValue?: string): string {
    const value = process.env[key];
    if (value === undefined || value === '') {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw new ConfigError(`環境変数 ${key} が設定されていません`, key);
    }
    return value;
  }

  /**
   * 必須の環境変数から文字列値を取得
   */
  private getEnvStringRequired(key: string): string {
    const value = process.env[key];
    if (value === undefined || value === '') {
      throw new ConfigError(`必須の環境変数 ${key} が設定されていません`, key);
    }
    return value;
  }

  /**
   * 環境変数から数値を取得
   */
  private getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (value === undefined || value === '') {
      return defaultValue;
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new ConfigError(`環境変数 ${key} は数値である必要があります: ${value}`, key);
    }
    return parsed;
  }

  /**
   * 環境変数からブール値を取得
   */
  private getEnvBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (value === undefined || value === '') {
      return defaultValue;
    }
    return value.toLowerCase() === 'true';
  }

  /**
   * CORS オリジンを解析
   */
  private parseCorsOrigin(origin: string): string | string[] {
    if (origin === '*') {
      return '*';
    }
    return origin.split(',').map(o => o.trim());
  }

  /**
   * 必須値を検証
   */
  private validateRequired(value: any, key: string): void {
    if (value === undefined || value === null || value === '') {
      throw new ConfigError(`${key} は必須です`, key);
    }
  }

  /**
   * ポート番号を検証
   */
  private validatePort(port: number, key: string): void {
    if (port < 1 || port > 65535) {
      throw new ConfigError(`${key} は1-65535の範囲で設定してください: ${port}`, key);
    }
  }

  /**
   * ファイル存在を検証
   */
  private validateFileExists(filePath: string, key: string): void {
    if (!fs.existsSync(filePath)) {
      throw new ConfigError(`${key} で指定されたファイルが見つかりません: ${filePath}`, key);
    }
  }

  /**
   * データベース接続文字列を生成
   */
  public getDatabaseUrl(): string {
    const db = this.get('database');
    return `${db.type}://${db.username}:${db.password}@${db.host}:${db.port}/${db.name}`;
  }

  /**
   * Redis接続文字列を生成
   */
  public getRedisUrl(): string {
    const redis = this.get('services').redis;
    const auth = redis.password ? `:${redis.password}@` : '';
    return `redis://${auth}${redis.host}:${redis.port}/${redis.db}`;
  }

  /**
   * 環境情報を出力（デバッグ用）
   */
  public logEnvironmentInfo(): void {
    const config = this.getConfig();
    console.log('=== 環境設定情報 ===');
    console.log(`アプリケーション: ${config.app.name} v${config.app.version}`);
    console.log(`環境: ${config.app.env}`);
    console.log(`サーバー: ${config.server.host}:${config.server.port}`);
    console.log(`データベース: ${config.database.type}://${config.database.host}:${config.database.port}/${config.database.name}`);
    console.log(`ログレベル: ${config.app.logLevel}`);
    console.log(`デバッグモード: ${config.app.debug}`);
    console.log('==================');
  }
}

// シングルトンインスタンスをエクスポート
export const configManager = ConfigManager.getInstance();