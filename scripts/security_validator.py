#!/usr/bin/env python3
"""
ITサービス管理システム - セキュリティ検証スクリプト
ISO 27001/27002 準拠のセキュリティ要件チェック

使用方法:
    python scripts/security_validator.py
    python scripts/security_validator.py --env-file .env.production
    python scripts/security_validator.py --fix-weak-keys
"""

import os
import re
import sys
import json
import secrets
import hashlib
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import base64
import logging

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('SecurityValidator')

class SecurityValidator:
    """セキュリティ検証クラス"""
    
    def __init__(self, env_file: str = '.env'):
        self.env_file = Path(env_file)
        self.project_root = Path(__file__).parent.parent
        self.env_vars = {}
        self.security_issues = []
        self.warnings = []
        
        # 弱いパスワード/キーのパターン
        self.weak_patterns = [
            r'password',
            r'123456',
            r'admin',
            r'secret',
            r'your-.*-here',
            r'change.?me',
            r'replace.?with',
            r'example',
            r'test',
            r'demo',
            r'default'
        ]
        
        # 必須環境変数とその要件
        self.required_vars = {
            'JWT_SECRET': {'min_length': 32, 'type': 'secret'},
            'SESSION_SECRET': {'min_length': 24, 'type': 'secret'},
            'CSRF_SECRET': {'min_length': 24, 'type': 'secret'},
            'DB_PASSWORD': {'min_length': 12, 'type': 'password'},
        }
        
        # 本番環境必須設定
        self.production_requirements = {
            'NODE_ENV': 'production',
            'APP_DEBUG': 'false',
            'SERVER_HTTPS_ENABLED': 'true',
            'DB_SSL': 'true',
            'SECURITY_HSTS_ENABLED': 'true',
            'SECURITY_CSP_ENABLED': 'true',
        }

    def load_env_file(self) -> bool:
        """環境変数ファイルを読み込む"""
        if not self.env_file.exists():
            logger.error(f"環境変数ファイルが見つかりません: {self.env_file}")
            return False
        
        try:
            with open(self.env_file, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if line and not line.startswith('#'):
                        if '=' in line:
                            key, value = line.split('=', 1)
                            self.env_vars[key.strip()] = {
                                'value': value.strip(),
                                'line_number': line_num
                            }
            
            logger.info(f"環境変数を読み込みました: {len(self.env_vars)}個")
            return True
            
        except Exception as e:
            logger.error(f"環境変数ファイルの読み込みに失敗: {e}")
            return False

    def check_weak_secrets(self) -> List[Dict]:
        """弱いシークレット・パスワードをチェック"""
        weak_secrets = []
        
        for var_name, var_data in self.env_vars.items():
            value = var_data['value'].strip('"\'')
            
            # 空の値をチェック
            if not value or value in ['', '""', "''"]:
                if var_name in self.required_vars:
                    weak_secrets.append({
                        'variable': var_name,
                        'issue': 'empty_value',
                        'severity': 'critical',
                        'line': var_data['line_number'],
                        'description': f'{var_name} が空です'
                    })
                continue
            
            # 弱いパターンをチェック
            for pattern in self.weak_patterns:
                if re.search(pattern, value, re.IGNORECASE):
                    weak_secrets.append({
                        'variable': var_name,
                        'issue': 'weak_pattern',
                        'severity': 'high',
                        'line': var_data['line_number'],
                        'pattern': pattern,
                        'description': f'{var_name} に弱いパターンが検出されました: {pattern}'
                    })
            
            # 必須変数の長さをチェック
            if var_name in self.required_vars:
                required = self.required_vars[var_name]
                if len(value) < required['min_length']:
                    weak_secrets.append({
                        'variable': var_name,
                        'issue': 'insufficient_length',
                        'severity': 'high',
                        'line': var_data['line_number'],
                        'current_length': len(value),
                        'required_length': required['min_length'],
                        'description': f'{var_name} の長さが不十分です ({len(value)}/{required["min_length"]})'
                    })
            
            # パスワードの複雑さをチェック
            if 'password' in var_name.lower() or var_name in ['JWT_SECRET', 'SESSION_SECRET', 'CSRF_SECRET']:
                if not self._check_password_complexity(value):
                    weak_secrets.append({
                        'variable': var_name,
                        'issue': 'insufficient_complexity',
                        'severity': 'medium',
                        'line': var_data['line_number'],
                        'description': f'{var_name} の複雑さが不十分です（英数字記号を組み合わせてください）'
                    })
        
        return weak_secrets

    def check_production_readiness(self) -> List[Dict]:
        """本番環境準備状況をチェック"""
        issues = []
        
        for var_name, required_value in self.production_requirements.items():
            if var_name not in self.env_vars:
                issues.append({
                    'variable': var_name,
                    'issue': 'missing_production_setting',
                    'severity': 'high',
                    'required_value': required_value,
                    'description': f'本番環境必須設定 {var_name} がありません'
                })
            else:
                current_value = self.env_vars[var_name]['value'].strip('"\'').lower()
                if current_value != required_value.lower():
                    issues.append({
                        'variable': var_name,
                        'issue': 'incorrect_production_setting',
                        'severity': 'medium',
                        'line': self.env_vars[var_name]['line_number'],
                        'current_value': current_value,
                        'required_value': required_value,
                        'description': f'{var_name} の本番環境設定が正しくありません'
                    })
        
        return issues

    def check_sensitive_data_exposure(self) -> List[Dict]:
        """機密情報露出をチェック"""
        exposures = []
        
        # API キー・トークンのパターン
        sensitive_patterns = {
            'aws_access_key': r'AKIA[0-9A-Z]{16}',
            'aws_secret_key': r'[0-9a-zA-Z/+]{40}',
            'google_api_key': r'AIza[0-9A-Za-z_-]{35}',
            'slack_token': r'xox[baprs]-[0-9a-zA-Z-]{10,48}',
            'github_token': r'gh[pousr]_[0-9A-Za-z]{36}',
            'jwt_token': r'eyJ[0-9A-Za-z_-]+\.[0-9A-Za-z_-]+\.[0-9A-Za-z_-]+',
        }
        
        for var_name, var_data in self.env_vars.items():
            value = var_data['value'].strip('"\'')
            
            # 既知の機密パターンをチェック
            for pattern_name, pattern in sensitive_patterns.items():
                if re.search(pattern, value):
                    exposures.append({
                        'variable': var_name,
                        'issue': 'sensitive_pattern_detected',
                        'severity': 'critical',
                        'line': var_data['line_number'],
                        'pattern_type': pattern_name,
                        'description': f'{var_name} に機密情報パターンが検出されました: {pattern_name}'
                    })
            
            # プレーンテキスト機密情報の疑いをチェック
            if any(keyword in var_name.upper() for keyword in ['SECRET', 'KEY', 'TOKEN', 'PASSWORD']):
                if len(value) > 10 and not value.startswith('CHANGE_ME') and not value.startswith('REPLACE_WITH'):
                    # Base64エンコードされていない場合は警告
                    try:
                        base64.b64decode(value)
                    except:
                        if not re.match(r'^[0-9a-f]{32,}$', value):  # ハッシュ値でない場合
                            exposures.append({
                                'variable': var_name,
                                'issue': 'plaintext_sensitive_data',
                                'severity': 'medium',
                                'line': var_data['line_number'],
                                'description': f'{var_name} がプレーンテキストの可能性があります'
                            })
        
        return exposures

    def check_ssl_tls_config(self) -> List[Dict]:
        """SSL/TLS設定をチェック"""
        ssl_issues = []
        
        # HTTPS必須チェック
        if 'SERVER_HTTPS_ENABLED' in self.env_vars:
            https_enabled = self.env_vars['SERVER_HTTPS_ENABLED']['value'].strip('"\'').lower()
            if https_enabled != 'true':
                ssl_issues.append({
                    'variable': 'SERVER_HTTPS_ENABLED',
                    'issue': 'https_not_enabled',
                    'severity': 'high',
                    'line': self.env_vars['SERVER_HTTPS_ENABLED']['line_number'],
                    'description': 'HTTPS が有効化されていません (ISO 27002: 13.2.1)'
                })
        
        # SSL証明書パスの存在チェック
        cert_vars = ['SERVER_SSL_CERT_PATH', 'SERVER_SSL_KEY_PATH']
        for var_name in cert_vars:
            if var_name in self.env_vars:
                cert_path = Path(self.env_vars[var_name]['value'].strip('"\''))
                if not cert_path.is_absolute():
                    cert_path = self.project_root / cert_path
                
                if not cert_path.exists():
                    ssl_issues.append({
                        'variable': var_name,
                        'issue': 'cert_file_missing',
                        'severity': 'medium',
                        'line': self.env_vars[var_name]['line_number'],
                        'path': str(cert_path),
                        'description': f'SSL証明書ファイルが見つかりません: {cert_path}'
                    })
        
        return ssl_issues

    def generate_secure_key(self, length: int = 32, encoding: str = 'base64') -> str:
        """セキュアなキーを生成"""
        random_bytes = secrets.token_bytes(length)
        
        if encoding == 'base64':
            return base64.b64encode(random_bytes).decode('utf-8')
        elif encoding == 'hex':
            return random_bytes.hex()
        else:
            return secrets.token_urlsafe(length)

    def fix_weak_keys(self) -> Dict[str, str]:
        """弱いキーを修正"""
        fixed_keys = {}
        
        # 弱いキーを特定
        weak_secrets = self.check_weak_secrets()
        
        for issue in weak_secrets:
            var_name = issue['variable']
            
            if var_name in self.required_vars and issue['issue'] in ['weak_pattern', 'insufficient_length', 'empty_value']:
                # 新しいセキュアなキーを生成
                if var_name == 'JWT_SECRET':
                    new_value = self.generate_secure_key(64, 'base64')
                elif var_name in ['SESSION_SECRET', 'CSRF_SECRET']:
                    new_value = self.generate_secure_key(32, 'base64')
                elif var_name == 'DB_PASSWORD':
                    new_value = self._generate_secure_password(16)
                else:
                    new_value = self.generate_secure_key(32, 'base64')
                
                fixed_keys[var_name] = new_value
                logger.info(f"{var_name} の弱いキーを修正しました")
        
        return fixed_keys

    def _check_password_complexity(self, password: str) -> bool:
        """パスワードの複雑さをチェック"""
        if len(password) < 8:
            return False
        
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
        
        return sum([has_upper, has_lower, has_digit, has_special]) >= 3

    def _generate_secure_password(self, length: int = 16) -> str:
        """セキュアなパスワードを生成"""
        import string
        
        # 各カテゴリから最低1文字を確保
        password = [
            secrets.choice(string.ascii_uppercase),
            secrets.choice(string.ascii_lowercase),
            secrets.choice(string.digits),
            secrets.choice("!@#$%^&*()_+-=")
        ]
        
        # 残りをランダムに生成
        all_chars = string.ascii_letters + string.digits + "!@#$%^&*()_+-="
        for _ in range(length - 4):
            password.append(secrets.choice(all_chars))
        
        # シャッフル
        secrets.SystemRandom().shuffle(password)
        return ''.join(password)

    def generate_report(self) -> Dict:
        """セキュリティレポートを生成"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'env_file': str(self.env_file),
            'total_variables': len(self.env_vars),
            'security_issues': {
                'weak_secrets': self.check_weak_secrets(),
                'production_readiness': self.check_production_readiness(),
                'sensitive_data_exposure': self.check_sensitive_data_exposure(),
                'ssl_tls_config': self.check_ssl_tls_config(),
            },
            'summary': {}
        }
        
        # サマリーを計算
        total_issues = 0
        critical_count = 0
        high_count = 0
        medium_count = 0
        
        for category, issues in report['security_issues'].items():
            total_issues += len(issues)
            for issue in issues:
                severity = issue.get('severity', 'low')
                if severity == 'critical':
                    critical_count += 1
                elif severity == 'high':
                    high_count += 1
                elif severity == 'medium':
                    medium_count += 1
        
        report['summary'] = {
            'total_issues': total_issues,
            'critical': critical_count,
            'high': high_count,
            'medium': medium_count,
            'security_score': max(0, 100 - (critical_count * 25 + high_count * 10 + medium_count * 5))
        }
        
        return report

    def print_report(self, report: Dict):
        """レポートを表示"""
        print("\n" + "="*70)
        print("         ITサービス管理システム - セキュリティ検証レポート")
        print("="*70)
        print(f"検証日時: {report['timestamp']}")
        print(f"対象ファイル: {report['env_file']}")
        print(f"環境変数数: {report['total_variables']}")
        print("-"*70)
        
        summary = report['summary']
        print(f"セキュリティスコア: {summary['security_score']}/100")
        print(f"総問題数: {summary['total_issues']}")
        print(f"  - 重大: {summary['critical']}")
        print(f"  - 高: {summary['high']}")
        print(f"  - 中: {summary['medium']}")
        print("-"*70)
        
        # 詳細問題を表示
        for category, issues in report['security_issues'].items():
            if issues:
                print(f"\n【{category.upper()}】")
                for issue in issues:
                    severity_mark = {
                        'critical': '🔴',
                        'high': '🟠',
                        'medium': '🟡',
                        'low': '🟢'
                    }.get(issue.get('severity', 'low'), '⚪')
                    
                    print(f"  {severity_mark} {issue['description']}")
                    if 'line' in issue:
                        print(f"     行番号: {issue['line']}")
                    if 'current_value' in issue and 'required_value' in issue:
                        print(f"     現在値: {issue['current_value']}")
                        print(f"     推奨値: {issue['required_value']}")
        
        print("\n" + "="*70)
        
        # 推奨アクション
        if summary['total_issues'] > 0:
            print("推奨アクション:")
            if summary['critical'] > 0:
                print("  1. 🔴 重大な問題を直ちに修正してください")
            if summary['high'] > 0:
                print("  2. 🟠 高優先度の問題を修正してください")
            print("  3. --fix-weak-keys オプションで弱いキーを自動修正できます")
            print("  4. 本番環境では .env.production.example を使用してください")
        else:
            print("✅ セキュリティ検証に合格しました！")

def main():
    parser = argparse.ArgumentParser(description='ITサービス管理システム セキュリティ検証')
    parser.add_argument('--env-file', default='.env', help='検証する環境変数ファイル')
    parser.add_argument('--fix-weak-keys', action='store_true', help='弱いキーを自動修正')
    parser.add_argument('--output-json', help='レポートをJSONファイルに出力')
    parser.add_argument('--silent', action='store_true', help='サイレントモード')
    
    args = parser.parse_args()
    
    if args.silent:
        logging.getLogger().setLevel(logging.ERROR)
    
    validator = SecurityValidator(args.env_file)
    
    if not validator.load_env_file():
        sys.exit(1)
    
    # セキュリティ検証実行
    report = validator.generate_report()
    
    # 弱いキーの修正
    if args.fix_weak_keys:
        fixed_keys = validator.fix_weak_keys()
        if fixed_keys:
            print(f"\n修正された環境変数:")
            for var_name, new_value in fixed_keys.items():
                print(f"  {var_name}={new_value}")
            print(f"\n注意: .env ファイルを手動で更新してください")
    
    # レポート出力
    if args.output_json:
        with open(args.output_json, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print(f"レポートを保存しました: {args.output_json}")
    
    if not args.silent:
        validator.print_report(report)
    
    # 重大な問題がある場合は終了コード1
    if report['summary']['critical'] > 0:
        sys.exit(1)

if __name__ == '__main__':
    main()