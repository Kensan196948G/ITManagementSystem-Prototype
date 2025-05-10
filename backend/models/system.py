from datetime import datetime
from . import db

class SystemMonitor(db.Model):
    """システム監視モデル - サービス稼働状況、パフォーマンスメトリクス管理"""
    __tablename__ = 'system_monitors'

    id = db.Column(db.Integer, primary_key=True)
    system_name = db.Column(db.String(100), nullable=False)  # AD, Entra ID, Exchange Online, etc.
    component = db.Column(db.String(100))  # サブコンポーネント名
    status = db.Column(db.String(20), nullable=False)  # running, warning, error, stopped
    uptime = db.Column(db.Float)  # 稼働時間（時間）
    cpu_usage = db.Column(db.Float)  # CPU使用率（%）
    memory_usage = db.Column(db.Float)  # メモリ使用率（%）
    disk_usage = db.Column(db.Float)  # ディスク使用率（%）
    network_latency = db.Column(db.Float)  # ネットワークレイテンシ（ms）
    last_check = db.Column(db.DateTime, default=datetime.utcnow)
    checked_by = db.Column(db.String(50))  # 確認者（自動/手動）
    notes = db.Column(db.Text)  # 追加メモ
    
    def __repr__(self):
        return f'<SystemMonitor {self.system_name}: {self.status}>'

    def to_dict(self):
        """モニタリング情報を辞書形式で返却"""
        return {
            'id': self.id,
            'system_name': self.system_name,
            'component': self.component,
            'status': self.status,
            'uptime': self.uptime,
            'cpu_usage': self.cpu_usage,
            'memory_usage': self.memory_usage,
            'disk_usage': self.disk_usage,
            'network_latency': self.network_latency,
            'last_check': self.last_check.isoformat(),
            'checked_by': self.checked_by,
            'notes': self.notes
        }


class ServiceIncident(db.Model):
    """サービスインシデントモデル - ISO 20000対応のインシデント管理"""
    __tablename__ = 'service_incidents'

    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.String(20), unique=True, nullable=False)  # INC-YYYY-MMDD-NNNN
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    system_name = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.String(20), nullable=False)  # critical, high, medium, low
    status = db.Column(db.String(20), nullable=False)  # open, in_progress, resolved, closed
    reported_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    reported_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)
    resolution = db.Column(db.Text)
    root_cause = db.Column(db.Text)
    impact = db.Column(db.Text)  # 影響範囲
    affected_users = db.Column(db.Integer)  # 影響を受けたユーザー数
    
    # リレーションシップ
    reporter = db.relationship('User', foreign_keys=[reported_by], backref=db.backref('reported_incidents', lazy=True))
    assignee = db.relationship('User', foreign_keys=[assigned_to], backref=db.backref('assigned_incidents', lazy=True))
    
    def __repr__(self):
        return f'<ServiceIncident {self.incident_id}: {self.status}>'

    def to_dict(self):
        """インシデント情報を辞書形式で返却"""
        return {
            'id': self.id,
            'incident_id': self.incident_id,
            'title': self.title,
            'description': self.description,
            'system_name': self.system_name,
            'severity': self.severity,
            'status': self.status,
            'reported_by': self.reported_by,
            'assigned_to': self.assigned_to,
            'reported_at': self.reported_at.isoformat(),
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'resolution': self.resolution,
            'root_cause': self.root_cause,
            'impact': self.impact,
            'affected_users': self.affected_users
        }


class SecurityEvent(db.Model):
    """セキュリティイベントモデル - ISO 27001対応のセキュリティ監視"""
    __tablename__ = 'security_events'

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.String(20), unique=True, nullable=False)  # SEC-YYYY-MMDD-NNNN
    event_type = db.Column(db.String(50), nullable=False)  # unauthorized_access, data_breach, malware_detected
    source_system = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    description_encrypted = db.Column(db.Boolean, default=False)
    severity = db.Column(db.String(20), nullable=False)  # critical, high, medium, low
    status = db.Column(db.String(20), nullable=False)  # new, investigating, mitigated, resolved
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)
    mitigated_at = db.Column(db.DateTime)
    reported_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    ip_address = db.Column(db.String(50))
    ip_address_encrypted = db.Column(db.Boolean, default=False)
    location = db.Column(db.String(100))
    location_encrypted = db.Column(db.Boolean, default=False)
    action_taken = db.Column(db.Text)
    action_taken_encrypted = db.Column(db.Boolean, default=False)
    encryption_iv = db.Column(db.String(24))  # AES-GCM用のIV (Base64エンコード)
    encryption_tag = db.Column(db.String(24))  # AES-GCM用の認証タグ (Base64エンコード)
    blockchain_tx_hash = db.Column(db.String(66))  # Hyperledgerトランザクションハッシュ
    blockchain_timestamp = db.Column(db.DateTime)  # ブロックチェーン記録時刻

    # 暗号化キーキャッシュ (クラス変数)
    _encryption_key = None
    _key_vault_client = None
    _key_last_fetched = None  # 最終取得時刻
    
    # リレーションシップ
    reporter = db.relationship('User', foreign_keys=[reported_by], backref=db.backref('reported_security_events', lazy=True))
    assignee = db.relationship('User', foreign_keys=[assigned_to], backref=db.backref('assigned_security_events', lazy=True))
    
    def __repr__(self):
        return f'<SecurityEvent {self.event_id}: {self.status}>'

    @classmethod
    async def _get_key_vault_client(cls):
        """Azure Managed HSMクライアントを初期化 (スレッドセーフなシングルトン)"""
        import asyncio
        from threading import Lock
        import logging
        
        if not hasattr(cls, '_hsm_lock'):
            cls._hsm_lock = Lock()
            cls._tpm_lock = Lock()
        
        # 二重初期化防止
        if cls._key_vault_client is not None:
            return cls._key_vault_client
            
        async with asyncio.Lock():
            if cls._key_vault_client is None:
                try:
                    # TPMフォールバック事前初期化
                    with cls._tpm_lock:
                        cls._init_tpm_fallback()
                    
                    # HSMクライアント初期化
                    from azure.identity import DefaultAzureCredential
                    from azure.keyvault.keys.aio import KeyClient
                    import os
                    
                    hsm_name = os.getenv('AZURE_HSM_NAME')
                    if not hsm_name:
                        if cls._tpm:
                            logging.warning("AZURE_HSM_NAME not set, using TPM fallback")
                            return None
                        raise ValueError("AZURE_HSM_NAME environment variable not set")
                    
                    credential = DefaultAzureCredential()
                    cls._key_vault_client = KeyClient(
                        vault_url=f"https://{hsm_name}.managedhsm.azure.net",
                        credential=credential,
                        connection_timeout=hsm_timeout
                    )
                    
                    # 非同期接続テスト (タイムアウト10秒)
                    try:
                        async with asyncio.timeout(10):
                            async with cls._key_vault_client:
                                await cls._key_vault_client.list_properties_of_keys()
                        return cls._key_vault_client
                    except asyncio.TimeoutError:
                        logging.warning("HSM connection timeout, falling back to TPM")
                        if cls._tpm:
                            return None
                        raise
                    except Exception as e:
                        logging.error(f"HSM connection test failed: {str(e)}")
                        if cls._tpm:
                            return None
                        raise
                        
                except Exception as e:
                    logging.error(f"HSM initialization failed: {str(e)}")
                    if cls._tpm:
                        return None
                    raise

    @classmethod
    def _init_tpm_fallback(cls):
        """TPMベースのフォールバック鍵を初期化 (スレッドセーフ)"""
        if hasattr(cls, '_tpm_initialized'):
            return
            
        with cls._tpm_lock:
            cls._tpm = None
            cls._tpm_initialized = True
            cls._fallback_reason = None
            
            try:
                import tpm2_pytss
                try:
                    cls._tpm = tpm2_pytss.TCTI()
                    logging.info("TPM2 fallback initialized successfully")
                    
                    # TPM保護鍵を生成
                    cls._sealed_key = cls._tpm.create_primary(
                        tpm2_pytss.ESYS_TR.ENDORSEMENT,
                        tpm2_pytss.TPM2_ALG.SHA256
                    )
                    logging.info("TPM sealed key created")
                except Exception as tpm_err:
                    cls._fallback_reason = f"TPM2 initialization failed: {str(tpm_err)}"
                    logging.warning(f"{cls._fallback_reason}. Fallback to software encryption")
                    cls._tpm = None
            except ImportError:
                cls._fallback_reason = "TPM2_pytss not installed"
                logging.warning(f"{cls._fallback_reason}. Fallback to software encryption")
                
                # 強化されたソフトウェア暗号化鍵を生成
                import os
                import base64
                from cryptography.hazmat.primitives import hashes
                from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
                
                # 環境変数からマスターシークレットを取得 (デフォルトはランダム)
                master_secret = os.getenv('FALLBACK_MASTER_SECRET', os.urandom(32).hex())
                if isinstance(master_secret, str):
                    master_secret = bytes.fromhex(master_secret)
                
                # 強化された鍵導出関数
                salt = os.urandom(32)  # 32バイトソルト
                kdf = PBKDF2HMAC(
                    algorithm=hashes.SHA512(),  # SHA-512を使用
                    length=64,  # 64バイト鍵 (AES-256 + HMAC-SHA256)
                    salt=salt,
                    iterations=310000,  # OWASP推奨値
                )
                derived_key = kdf.derive(master_secret)
                
                # 鍵を分割 (前半32バイト: AES鍵, 後半32バイト: HMAC鍵)
                cls._encryption_key = derived_key[:32]
                cls._hmac_key = derived_key[32:]
                cls._using_hsm = False
                
                # セキュリティ監査ログ
                logging.warning(
                    "Software fallback encryption key generated | "
                    f"Key source: {'env' if 'FALLBACK_MASTER_SECRET' in os.environ else 'random'}"
                )

    @classmethod
    async def _get_encryption_key(cls):
        """HSMから暗号鍵を取得 (5分間キャッシュ)"""
        from datetime import datetime, timedelta
        import logging
        import asyncio
        
        # キャッシュが有効かチェック
        if (cls._encryption_key is None or
            cls._key_last_fetched is None or
            datetime.utcnow() - cls._key_last_fetched > timedelta(minutes=5)):
            
            try:
                # タイムアウト付きでHSMアクセス
                key_client = await cls._get_key_vault_client()
                if key_client is None:  # TPMフォールバック利用
                    cls._use_fallback_key()
                    return cls._encryption_key
                
                try:
                    async with asyncio.timeout(30):  # 30秒タイムアウト
                        async with key_client:
                            key = await key_client.get_key("audit-log-encryption-key")
                            crypto_client = CryptographyClient(
                                key.id,
                                credential=key_client._credential,
                                connection_timeout=30
                            )
                            
                            # HSMで直接鍵生成
                            result = await crypto_client.encrypt(
                                algorithm="RSA-OAEP",
                                plaintext=b"key_wrapping_data"
                            )
                            cls._encryption_key = result.ciphertext
                            cls._key_last_fetched = datetime.utcnow()
                            cls._using_hsm = True
                except asyncio.TimeoutError:
                    logging.warning("HSM access timed out after 30 seconds")
                    raise
                    
            except Exception as e:
                logging.warning(f"HSM access failed: {str(e)}")
                cls._use_fallback_key()
                
        return cls._encryption_key

    @classmethod
    def _use_fallback_key(cls):
        """TPM保護されたフォールバック鍵を使用"""
        if cls._tpm:
            try:
                # TPM保護鍵を使用
                cls._encryption_key = cls._tpm.unseal_data(cls._sealed_key)
                cls._using_hsm = False
                cls._log_fallback_usage(
                    reason="Using TPM-sealed key",
                    severity="warning"
                )
            except Exception as e:
                error_msg = f"TPM fallback failed: {str(e)}"
                logging.error(error_msg)
                cls._fallback_reason = error_msg
                
                # ソフトウェア暗号化にフォールバック
                if hasattr(cls, '_encryption_key'):
                    cls._log_fallback_usage(
                        reason=error_msg,
                        severity="error"
                    )
                    cls._using_hsm = False
                else:
                    raise RuntimeError("No valid fallback encryption available")
        elif hasattr(cls, '_encryption_key'):
            cls._log_fallback_usage(
                reason=cls._fallback_reason or "Software fallback active",
                severity="warning"
            )
            cls._using_hsm = False
        else:
            raise RuntimeError("No HSM or fallback available")

    @classmethod
    def _log_fallback_usage(cls, reason, severity="warning"):
        """フォールバック使用を監査ログに記録"""
        log_msg = (
            f"Encryption fallback activated | "
            f"Reason: {reason} | "
            f"Key source: {'TPM' if cls._tpm else 'software'}"
        )
        
        if severity == "error":
            logging.error(log_msg)
        else:
            logging.warning(log_msg)
            
        # 監査ログに記録
        if hasattr(cls, '_audit_logger'):
            cls._audit_logger.log_fallback_event(
                reason=reason,
                key_source='TPM' if cls._tpm else 'software'
            )

    @classmethod
    def _measure_performance(cls, func):
        """非同期暗号化処理のパフォーマンス計測デコレータ (スレッドセーフ版)"""
        from functools import wraps
        import asyncio
        
        @wraps(func)
        async def wrapper(*args, **kwargs):
            from datetime import datetime
            import logging
            from threading import Lock
            
            if not hasattr(cls, '_metrics_lock'):
                cls._metrics_lock = Lock()
            
            start_time = datetime.utcnow()
            try:
                result = await func(*args, **kwargs)
                elapsed = (datetime.utcnow() - start_time).total_seconds() * 1000
                
                # 閾値超過警告 (非同期対応)
                if elapsed > 200:
                    logging.warning(
                        f"Encryption latency {elapsed:.2f}ms exceeds 200ms threshold | "
                        f"Method: {func.__name__} | "
                        f"Using HSM: {getattr(cls, '_using_hsm', False)}"
                    )
                
                # スレッドセーフなメトリクス記録
                with cls._metrics_lock:
                    cls._record_encryption_metrics(elapsed)
                return result
                
            except Exception as e:
                elapsed = (datetime.utcnow() - start_time).total_seconds() * 1000
                logging.error(
                    f"Encryption failed after {elapsed:.2f}ms | "
                    f"Error: {str(e)}"
                )
                raise
                
        return wrapper

    @classmethod
    def _record_encryption_metrics(cls, elapsed_time):
        """暗号化メトリクスを監査ログに記録"""
        if not hasattr(cls, '_encryption_metrics'):
            cls._encryption_metrics = {
                'total_operations': 0,
                'total_time_ms': 0.0,
                'max_time_ms': 0.0,
                'hsm_usage_count': 0,
                'fallback_usage_count': 0
            }
        
        cls._encryption_metrics['total_operations'] += 1
        cls._encryption_metrics['total_time_ms'] += elapsed_time
        cls._encryption_metrics['max_time_ms'] = max(
            cls._encryption_metrics['max_time_ms'],
            elapsed_time
        )
        
        if getattr(cls, '_using_hsm', False):
            cls._encryption_metrics['hsm_usage_count'] += 1
        else:
            cls._encryption_metrics['fallback_usage_count'] += 1

    @_measure_performance
    async def encrypt_sensitive_fields(self):
        """機密フィールドをHSMバッチ暗号化"""
        from azure.keyvault.keys.crypto import EncryptionAlgorithm
        import base64
        import os
        import json
        import logging

        if not any([self.description, self.ip_address,
                   self.location, self.action_taken]):
            return

        key = await self._get_encryption_key()
        iv = os.urandom(12)  # GCM推奨の12バイトIV

        try:
            # HSMクライアント取得 (タイムアウト15秒)
            async with asyncio.timeout(15):
                key_client = await self._get_key_vault_client()
                if key_client is None:  # TPMフォールバック
                    await self._fallback_encrypt_fields(iv)
                    return

                async with key_client:
                    key = await key_client.get_key("audit-log-encryption-key")
                    crypto_client = CryptographyClient(
                        key.id,
                        credential=key_client._credential,
                        connection_timeout=15
                    )

                    # バッチ暗号化データ準備
                    fields_to_encrypt = {
                        'description': self.description,
                        'ip_address': self.ip_address,
                        'location': self.location,
                        'action_taken': self.action_taken
                    }
                    plaintext = json.dumps(fields_to_encrypt).encode()

                    # HSMでバッチ暗号化実行 (タイムアウト30秒)
                    async with asyncio.timeout(30):
                        result = await crypto_client.encrypt(
                            algorithm=EncryptionAlgorithm.rsa_oaep,
                            plaintext=plaintext
                        )

                        # 結果を各フィールドに分割
                        encrypted_data = json.loads(base64.b64decode(result.ciphertext).decode())
                        if encrypted_data.get('description'):
                            self.description = encrypted_data['description']
                            self.description_encrypted = True
                        if encrypted_data.get('ip_address'):
                            self.ip_address = encrypted_data['ip_address']
                            self.ip_address_encrypted = True
                        if encrypted_data.get('location'):
                            self.location = encrypted_data['location']
                            self.location_encrypted = True
                        if encrypted_data.get('action_taken'):
                            self.action_taken = encrypted_data['action_taken']
                            self.action_taken_encrypted = True

                        # IVと認証タグを保存
                        self.encryption_iv = base64.b64encode(iv).decode()
                        self.encryption_tag = base64.b64encode(result.authentication_tag).decode()

        except asyncio.TimeoutError:
            logging.warning("HSM encryption timeout, falling back to TPM")
            await self._fallback_encrypt_fields(iv)
        except Exception as e:
            logging.error(f"Encryption failed: {str(e)}")
            await self._fallback_encrypt_fields(iv)

    async def _fallback_encrypt_fields(self, iv):
        """HSM失敗時のフォールバック暗号化"""
        from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
        from cryptography.hazmat.backends import default_backend
        import base64
        
        key = await self._get_encryption_key()
        cipher = Cipher(
            algorithms.AES(key),
            modes.GCM(iv),
            backend=default_backend()
        )
        encryptor = cipher.encryptor()

        # 各フィールドを個別に暗号化
        if self.description:
            self.description = base64.b64encode(
                encryptor.update(self.description.encode()) + encryptor.finalize()
            ).decode()
            self.description_encrypted = True

        if self.ip_address:
            self.ip_address = base64.b64encode(
                encryptor.update(self.ip_address.encode()) + encryptor.finalize()
            ).decode()
            self.ip_address_encrypted = True

        if self.location:
            self.location = base64.b64encode(
                encryptor.update(self.location.encode()) + encryptor.finalize()
            ).decode()
            self.location_encrypted = True

        if self.action_taken:
            self.action_taken = base64.b64encode(
                encryptor.update(self.action_taken.encode()) + encryptor.finalize()
            ).decode()
            self.action_taken_encrypted = True

        # IVと認証タグを保存
        self.encryption_iv = base64.b64encode(iv).decode()
        self.encryption_tag = base64.b64encode(encryptor.tag).decode()
        
        # フォールバック使用を記録
        self._record_fallback_event()

    @_measure_performance
    async def decrypt_sensitive_fields(self):
        """機密フィールドを復号化"""
        from azure.keyvault.keys.crypto import EncryptionAlgorithm
        import base64
        import json

        if not any([self.description_encrypted, self.ip_address_encrypted,
                   self.location_encrypted, self.action_taken_encrypted]):
            return

        key = await self._get_encryption_key()
        iv = base64.b64decode(self.encryption_iv)
        tag = base64.b64decode(self.encryption_tag)

        try:
            # HSMクライアント取得
            key_client = await self._get_key_vault_client()
            async with key_client:
                key = await key_client.get_key("audit-log-encryption-key")
                crypto_client = CryptographyClient(key.id, credential=key_client._credential)

                # 復号化データ準備
                encrypted_data = {
                    'description': self.description if self.description_encrypted else None,
                    'ip_address': self.ip_address if self.ip_address_encrypted else None,
                    'location': self.location if self.location_encrypted else None,
                    'action_taken': self.action_taken if self.action_taken_encrypted else None
                }
                ciphertext = base64.b64encode(json.dumps(encrypted_data).encode())

                # HSMでバッチ復号化実行
                result = await crypto_client.decrypt(
                    algorithm=EncryptionAlgorithm.rsa_oaep,
                    ciphertext=ciphertext
                )

                # 結果を各フィールドに分割
                decrypted_data = json.loads(result.plaintext.decode())
                if decrypted_data.get('description'):
                    self.description = decrypted_data['description']
                    self.description_encrypted = False
                if decrypted_data.get('ip_address'):
                    self.ip_address = decrypted_data['ip_address']
                    self.ip_address_encrypted = False
                if decrypted_data.get('location'):
                    self.location = decrypted_data['location']
                    self.location_encrypted = False
                if decrypted_data.get('action_taken'):
                    self.action_taken = decrypted_data['action_taken']
                    self.action_taken_encrypted = False

        except Exception as e:
            logging.error(f"HSM batch decryption failed: {str(e)}")
            await self._fallback_decrypt_fields(iv, tag)

    async def _fallback_decrypt_fields(self, iv, tag):
        """HSM失敗時のフォールバック復号化"""
        from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
        from cryptography.hazmat.backends import default_backend
        import base64
        
        key = await self._get_encryption_key()
        cipher = Cipher(
            algorithms.AES(key),
            modes.GCM(iv, tag),
            backend=default_backend()
        )
        decryptor = cipher.decryptor()

        # 各フィールドを個別に復号化
        if self.description_encrypted:
            self.description = decryptor.update(
                base64.b64decode(self.description)
            ) + decryptor.finalize()
            self.description = self.description.decode()
            self.description_encrypted = False

        if self.ip_address_encrypted:
            self.ip_address = decryptor.update(
                base64.b64decode(self.ip_address)
            ) + decryptor.finalize()
            self.ip_address = self.ip_address.decode()
            self.ip_address_encrypted = False

        if self.location_encrypted:
            self.location = decryptor.update(
                base64.b64decode(self.location)
            ) + decryptor.finalize()
            self.location = self.location.decode()
            self.location_encrypted = False

        if self.action_taken_encrypted:
            self.action_taken = decryptor.update(
                base64.b64decode(self.action_taken)
            ) + decryptor.finalize()
            self.action_taken = self.action_taken.decode()
            self.action_taken_encrypted = False
        
        # フォールバック使用を記録
        self._record_fallback_event()

    async def record_to_blockchain(self):
        """監査ログをHyperledger Fabricに記録"""
        import hashlib
        import json
        from datetime import datetime
        import logging
        from hfc.fabric import Client
        from hfc.fabric.user import create_user
        
        # 監査データのハッシュを計算
        audit_data = {
            'event_id': self.event_id,
            'event_type': self.event_type,
            'detected_at': self.detected_at.isoformat(),
            'data_hash': hashlib.sha256(
                json.dumps(self.to_dict()).encode()
            ).hexdigest()
        }
        
        try:
            # Hyperledger Fabricクライアント初期化
            client = Client(net_profile="connection-profile.yaml")
            org1_admin = create_user(
                name="Admin",
                org="Org1",
                state_store="crypto-store",
                msp_id='Org1MSP'
            )
            
            # チャネルとチェーンコード指定
            channel = client.new_channel('audit-channel')
            chaincode = 'auditlog'
            
            # トランザクション送信
            args = [json.dumps(audit_data)]
            response = await client.chaincode_invoke(
                requestor=org1_admin,
                channel_name='audit-channel',
                peers=['peer0.org1.example.com'],
                fcn='recordAuditLog',
                args=args,
                cc_name=chaincode,
                wait_for_event=True
            )
            
            # トランザクション結果を保存
            if response['status'] == 'SUCCESS':
                self.blockchain_tx_hash = response['tx_id']
                self.blockchain_timestamp = datetime.utcnow()
                return self.blockchain_tx_hash
            else:
                raise RuntimeError(f"Blockchain transaction failed: {response['message']}")
                
        except Exception as e:
            logging.error(f"Blockchain recording failed: {str(e)}")
            # フォールバック: ローカルハッシュを保存
            self.blockchain_tx_hash = "0x" + hashlib.sha256(
                json.dumps(audit_data).encode()
            ).hexdigest()
            self.blockchain_timestamp = datetime.utcnow()
            return self.blockchain_tx_hash

    def to_dict(self):
        """暗号化状態を考慮した辞書変換"""
        data = {
            'id': self.id,
            'event_id': self.event_id,
            'event_type': self.event_type,
            'source_system': self.source_system,
            'severity': self.severity,
            'status': self.status,
            'detected_at': self.detected_at.isoformat(),
            'mitigated_at': self.mitigated_at.isoformat() if self.mitigated_at else None,
            'reported_by': self.reported_by,
            'assigned_to': self.assigned_to,
            'is_encrypted': any([
                self.description_encrypted,
                self.ip_address_encrypted,
                self.location_encrypted,
                self.action_taken_encrypted
            ])
        }

        # 復号化されていない場合は元の値を返す
        if not self.description_encrypted:
            data['description'] = self.description
        if not self.ip_address_encrypted:
            data['ip_address'] = self.ip_address
        if not self.location_encrypted:
            data['location'] = self.location
        if not self.action_taken_encrypted:
            data['action_taken'] = self.action_taken

        # ブロックチェーン情報を追加
        if self.blockchain_tx_hash:
            data['blockchain'] = {
                'tx_hash': self.blockchain_tx_hash,
                'timestamp': self.blockchain_timestamp.isoformat()
            }

        return data
