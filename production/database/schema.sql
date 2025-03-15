-- ITマネジメントシステム データベーススキーマ
-- 本番環境用

-- ユーザーテーブル
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    display_name NVARCHAR(255) NOT NULL,
    user_role NVARCHAR(50) NOT NULL DEFAULT 'user',
    azure_id NVARCHAR(255) UNIQUE,
    department NVARCHAR(100),
    job_title NVARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    last_login DATETIME,
    is_active BIT NOT NULL DEFAULT 1
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_azure_id ON users(azure_id);

-- IT資産テーブル
CREATE TABLE assets (
    id INT IDENTITY(1,1) PRIMARY KEY,
    asset_tag NVARCHAR(50) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    asset_type NVARCHAR(50) NOT NULL,
    model NVARCHAR(255),
    serial_number NVARCHAR(255),
    purchase_date DATE,
    purchase_cost DECIMAL(10, 2),
    vendor NVARCHAR(255),
    warranty_expiry DATE,
    assigned_to INT,
    status NVARCHAR(50) NOT NULL DEFAULT 'available',
    location NVARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    last_checked DATETIME,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE INDEX idx_assets_asset_tag ON assets(asset_tag);
CREATE INDEX idx_assets_asset_type ON assets(asset_type);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_assigned_to ON assets(assigned_to);

-- メンテナンス履歴テーブル
CREATE TABLE maintenance_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    asset_id INT NOT NULL,
    maintenance_date DATETIME NOT NULL,
    maintenance_type NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    performed_by INT NOT NULL,
    cost DECIMAL(10, 2),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (performed_by) REFERENCES users(id)
);

CREATE INDEX idx_maintenance_logs_asset_id ON maintenance_logs(asset_id);
CREATE INDEX idx_maintenance_logs_maintenance_date ON maintenance_logs(maintenance_date);

-- ソフトウェアライセンステーブル
CREATE TABLE software_licenses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    vendor NVARCHAR(255),
    product_key NVARCHAR(255),
    seats INT NOT NULL DEFAULT 1,
    purchased_date DATE,
    expiration_date DATE,
    purchase_cost DECIMAL(10, 2),
    license_type NVARCHAR(100),
    notes NVARCHAR(MAX),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE INDEX idx_software_licenses_name ON software_licenses(name);
CREATE INDEX idx_software_licenses_expiration_date ON software_licenses(expiration_date);

-- ソフトウェア割り当てテーブル
CREATE TABLE software_assignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    license_id INT NOT NULL,
    asset_id INT NOT NULL,
    assigned_date DATETIME NOT NULL DEFAULT GETDATE(),
    assigned_by INT NOT NULL,
    notes NVARCHAR(MAX),
    FOREIGN KEY (license_id) REFERENCES software_licenses(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

CREATE INDEX idx_software_assignments_license_id ON software_assignments(license_id);
CREATE INDEX idx_software_assignments_asset_id ON software_assignments(asset_id);

-- サポートチケットテーブル
CREATE TABLE tickets (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    reported_by INT NOT NULL,
    assigned_to INT,
    asset_id INT,
    status NVARCHAR(50) NOT NULL DEFAULT 'open',
    priority NVARCHAR(50) NOT NULL DEFAULT 'medium',
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    resolved_at DATETIME,
    resolution NVARCHAR(MAX),
    FOREIGN KEY (reported_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_reported_by ON tickets(reported_by);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_asset_id ON tickets(asset_id);

-- チケットコメントテーブル
CREATE TABLE ticket_comments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    comment NVARCHAR(MAX) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);

-- システム設定テーブル
CREATE TABLE system_settings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    setting_key NVARCHAR(100) NOT NULL UNIQUE,
    setting_value NVARCHAR(MAX),
    description NVARCHAR(255),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- 監査ログテーブル
CREATE TABLE audit_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT,
    action NVARCHAR(255) NOT NULL,
    entity_type NVARCHAR(100) NOT NULL,
    entity_id INT,
    details NVARCHAR(MAX),
    ip_address NVARCHAR(50),
    user_agent NVARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- デフォルト管理者ユーザー
INSERT INTO users (username, email, display_name, user_role, department, job_title)
VALUES ('admin', 'admin@example.com', 'System Administrator', 'admin', 'IT', 'System Administrator');

-- デフォルト設定
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
    ('company_name', 'Example Corporation', 'Company name for reports and emails'),
    ('support_email', 'it-support@example.com', 'Default email for support tickets'),
    ('default_password_policy', 'strong', 'Password complexity requirement'),
    ('ticket_notification', 'true', 'Send email notifications for ticket updates'),
    ('maintenance_reminder_days', '30', 'Days before warranty expiry to send reminder');