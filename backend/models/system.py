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
    severity = db.Column(db.String(20), nullable=False)  # critical, high, medium, low
    status = db.Column(db.String(20), nullable=False)  # new, investigating, mitigated, resolved
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)
    mitigated_at = db.Column(db.DateTime)
    reported_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    ip_address = db.Column(db.String(50))
    location = db.Column(db.String(100))
    action_taken = db.Column(db.Text)
    
    # リレーションシップ
    reporter = db.relationship('User', foreign_keys=[reported_by], backref=db.backref('reported_security_events', lazy=True))
    assignee = db.relationship('User', foreign_keys=[assigned_to], backref=db.backref('assigned_security_events', lazy=True))
    
    def __repr__(self):
        return f'<SecurityEvent {self.event_id}: {self.status}>'
