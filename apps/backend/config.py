class Config:
    SECRET_KEY = 'your-secret-key'
    SESSION_TYPE = 'filesystem'

class DevelopmentConfig(Config):
    DEBUG = True
    ENV = 'development'