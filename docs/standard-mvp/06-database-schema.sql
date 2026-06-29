-- AI 扫码牌标准版 MVP 数据库结构
-- MySQL 8.x
-- 字符集建议：utf8mb4
-- 金额字段统一使用 decimal，时间字段统一保存服务器时间。

CREATE DATABASE IF NOT EXISTS ai_scan_card
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE ai_scan_card;

-- 1. 商户与门店

CREATE TABLE merchants (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  merchant_code VARCHAR(32) NOT NULL UNIQUE COMMENT '商户编码，如 MCH202606270001',
  merchant_name VARCHAR(128) NOT NULL COMMENT '商户主体名称',
  contact_name VARCHAR(64) NULL,
  contact_phone VARCHAR(32) NULL,
  plan_level ENUM('starter','standard','premium') NOT NULL DEFAULT 'standard',
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='商户主体表';

CREATE TABLE stores (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  store_code VARCHAR(32) NOT NULL UNIQUE COMMENT '门店编码，如 STORE001',
  merchant_id BIGINT UNSIGNED NOT NULL,
  store_name VARCHAR(128) NOT NULL,
  store_logo_url VARCHAR(512) NULL,
  address VARCHAR(255) NULL,
  phone VARCHAR(32) NULL,
  slogan VARCHAR(128) NULL COMMENT '如：吃肉的人终会相遇',
  brand_keywords JSON NULL COMMENT '门店关键词，如潮汕牛肉火锅、05后女生老板、性价比高',
  group_chat_url VARCHAR(512) NULL COMMENT '企微/微信群引导页',
  poster_template VARCHAR(64) NOT NULL DEFAULT 'hotpot_standard',
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_stores_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id)
) COMMENT='门店表';

CREATE TABLE store_tables (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT UNSIGNED NOT NULL,
  table_code VARCHAR(32) NOT NULL COMMENT '桌码，如 A01',
  table_name VARCHAR(64) NULL COMMENT '展示名，如 A01 靠窗',
  qr_scene VARCHAR(128) NOT NULL UNIQUE COMMENT '微信小程序 scene 参数',
  qr_image_url VARCHAR(512) NULL,
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_store_table (store_id, table_code),
  CONSTRAINT fk_store_tables_store FOREIGN KEY (store_id) REFERENCES stores(id)
) COMMENT='桌码表';

-- 2. 用户与会员

CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(96) NOT NULL UNIQUE,
  unionid VARCHAR(96) NULL,
  nickname VARCHAR(128) NULL,
  avatar_url VARCHAR(512) NULL,
  phone VARCHAR(32) NULL,
  first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='微信用户表，跨门店维度';

CREATE TABLE members (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  member_code VARCHAR(32) NOT NULL UNIQUE COMMENT '如 MEM202606270001',
  user_id BIGINT UNSIGNED NOT NULL,
  store_id BIGINT UNSIGNED NOT NULL,
  source ENUM('table_qr','poster_qr','manual','other') NOT NULL DEFAULT 'table_qr',
  inviter_member_id BIGINT UNSIGNED NULL,
  first_table_id BIGINT UNSIGNED NULL,
  first_visit_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_visit_at DATETIME NULL,
  visit_count INT UNSIGNED NOT NULL DEFAULT 1,
  status ENUM('active','blocked') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_member_user_store (user_id, store_id),
  KEY idx_members_store (store_id),
  KEY idx_members_inviter (inviter_member_id),
  CONSTRAINT fk_members_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_members_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_members_table FOREIGN KEY (first_table_id) REFERENCES store_tables(id)
) COMMENT='门店会员表';

CREATE TABLE member_sessions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  session_token CHAR(64) NOT NULL UNIQUE,
  user_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NOT NULL,
  store_id BIGINT UNSIGNED NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_session_member (member_id),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_sessions_member FOREIGN KEY (member_id) REFERENCES members(id),
  CONSTRAINT fk_sessions_store FOREIGN KEY (store_id) REFERENCES stores(id)
) COMMENT='小程序登录态表';

-- 3. 优惠券

CREATE TABLE coupon_templates (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT UNSIGNED NOT NULL,
  template_code VARCHAR(32) NOT NULL,
  coupon_type ENUM('base','reward','manual') NOT NULL,
  title VARCHAR(64) NOT NULL,
  description VARCHAR(255) NULL,
  discount_rate DECIMAL(5,2) NULL COMMENT '如 0.85 表示 85 折',
  gift_name VARCHAR(64) NULL COMMENT '赠品券名称',
  min_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  validity_days INT UNSIGNED NOT NULL DEFAULT 1,
  daily_limit_per_member INT UNSIGNED NOT NULL DEFAULT 1,
  total_stock INT UNSIGNED NULL,
  issued_count INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_coupon_template (store_id, template_code),
  CONSTRAINT fk_coupon_templates_store FOREIGN KEY (store_id) REFERENCES stores(id)
) COMMENT='优惠券模板表';

CREATE TABLE coupons (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  coupon_code VARCHAR(32) NOT NULL UNIQUE COMMENT '用于核销二维码',
  template_id BIGINT UNSIGNED NOT NULL,
  store_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NOT NULL,
  coupon_type ENUM('base','reward','manual') NOT NULL,
  status ENUM('unused','used','expired','void') NOT NULL DEFAULT 'unused',
  issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expire_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  verified_by BIGINT UNSIGNED NULL,
  order_amount DECIMAL(10,2) NULL,
  discount_amount DECIMAL(10,2) NULL,
  final_amount DECIMAL(10,2) NULL,
  idempotency_key VARCHAR(96) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_coupons_member_status (member_id, status),
  KEY idx_coupons_store_issued (store_id, issued_at),
  KEY idx_coupons_idempotency (idempotency_key),
  UNIQUE KEY uk_coupons_idempotency (idempotency_key),
  CONSTRAINT fk_coupons_template FOREIGN KEY (template_id) REFERENCES coupon_templates(id),
  CONSTRAINT fk_coupons_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_coupons_member FOREIGN KEY (member_id) REFERENCES members(id)
) COMMENT='已发放优惠券表';

CREATE TABLE coupon_daily_locks (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NOT NULL,
  coupon_type ENUM('base','reward','manual') NOT NULL,
  issue_date DATE NOT NULL,
  coupon_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_daily_coupon (store_id, member_id, coupon_type, issue_date)
) COMMENT='每日领券唯一约束表，防止重复发券';

-- 4. AI 任务、素材、海报

CREATE TABLE media_assets (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  asset_code VARCHAR(32) NOT NULL UNIQUE,
  store_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NULL,
  asset_type ENUM('original_image','enhanced_image','poster','video','other') NOT NULL,
  file_url VARCHAR(512) NOT NULL,
  file_mime VARCHAR(64) NULL,
  file_size_bytes BIGINT UNSIGNED NULL,
  width INT UNSIGNED NULL,
  height INT UNSIGNED NULL,
  source_asset_id BIGINT UNSIGNED NULL,
  content_safe_status ENUM('pending','pass','reject') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_media_member (member_id),
  KEY idx_media_store_type (store_id, asset_type),
  CONSTRAINT fk_media_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_media_member FOREIGN KEY (member_id) REFERENCES members(id)
) COMMENT='素材文件表';

CREATE TABLE ai_tasks (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  task_code VARCHAR(32) NOT NULL UNIQUE,
  store_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NOT NULL,
  task_type ENUM('text','image','poster','video') NOT NULL,
  provider VARCHAR(64) NULL COMMENT '如 qwen, hunyuan, aliyun_vision',
  model_name VARCHAR(128) NULL,
  prompt_version VARCHAR(32) NULL,
  input_payload JSON NOT NULL,
  output_payload JSON NULL,
  status ENUM('queued','running','succeeded','failed','fallback') NOT NULL DEFAULT 'queued',
  error_code VARCHAR(64) NULL,
  error_message VARCHAR(512) NULL,
  input_tokens INT UNSIGNED NULL,
  output_tokens INT UNSIGNED NULL,
  cost_amount DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
  latency_ms INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME NULL,
  finished_at DATETIME NULL,
  KEY idx_ai_member_created (member_id, created_at),
  KEY idx_ai_store_type_created (store_id, task_type, created_at),
  CONSTRAINT fk_ai_tasks_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_ai_tasks_member FOREIGN KEY (member_id) REFERENCES members(id)
) COMMENT='AI 调用任务表';

CREATE TABLE generated_posts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  post_code VARCHAR(32) NOT NULL UNIQUE,
  store_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NOT NULL,
  original_text VARCHAR(512) NULL,
  selected_text VARCHAR(512) NOT NULL,
  original_asset_id BIGINT UNSIGNED NULL,
  enhanced_asset_id BIGINT UNSIGNED NULL,
  poster_asset_id BIGINT UNSIGNED NULL,
  share_scene VARCHAR(128) NOT NULL UNIQUE COMMENT '海报二维码 scene',
  status ENUM('draft','generated','saved','void') NOT NULL DEFAULT 'generated',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_posts_member (member_id),
  KEY idx_posts_store_created (store_id, created_at),
  CONSTRAINT fk_posts_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_posts_member FOREIGN KEY (member_id) REFERENCES members(id),
  CONSTRAINT fk_posts_original_asset FOREIGN KEY (original_asset_id) REFERENCES media_assets(id),
  CONSTRAINT fk_posts_enhanced_asset FOREIGN KEY (enhanced_asset_id) REFERENCES media_assets(id),
  CONSTRAINT fk_posts_poster_asset FOREIGN KEY (poster_asset_id) REFERENCES media_assets(id)
) COMMENT='AI 朋友圈内容生成记录';

-- 5. 邀请裂变

CREATE TABLE invite_relations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  relation_code VARCHAR(32) NOT NULL UNIQUE,
  store_id BIGINT UNSIGNED NOT NULL,
  inviter_member_id BIGINT UNSIGNED NOT NULL,
  invitee_member_id BIGINT UNSIGNED NOT NULL,
  invite_depth TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '固定一级邀请，禁止多级分销',
  source_post_id BIGINT UNSIGNED NULL,
  bind_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  first_coupon_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_coupon_id BIGINT UNSIGNED NULL,
  reward_coupon_id BIGINT UNSIGNED NULL,
  reward_issued_at DATETIME NULL,
  UNIQUE KEY uk_invitee_store (store_id, invitee_member_id),
  KEY idx_inviter_store (store_id, inviter_member_id),
  CHECK (invite_depth = 1),
  CONSTRAINT fk_invite_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_invite_inviter FOREIGN KEY (inviter_member_id) REFERENCES members(id),
  CONSTRAINT fk_invite_invitee FOREIGN KEY (invitee_member_id) REFERENCES members(id),
  CONSTRAINT fk_invite_post FOREIGN KEY (source_post_id) REFERENCES generated_posts(id)
) COMMENT='邀请关系表';

CREATE TABLE invite_rewards (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  reward_code VARCHAR(32) NOT NULL UNIQUE,
  relation_id BIGINT UNSIGNED NOT NULL,
  store_id BIGINT UNSIGNED NOT NULL,
  inviter_member_id BIGINT UNSIGNED NOT NULL,
  invitee_member_id BIGINT UNSIGNED NOT NULL,
  trigger_coupon_id BIGINT UNSIGNED NULL COMMENT '触发奖励的新客核销券',
  reward_type ENUM('coupon','balance') NOT NULL DEFAULT 'coupon',
  reward_coupon_id BIGINT UNSIGNED NULL,
  reward_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('pending','issued','failed','void') NOT NULL DEFAULT 'pending',
  idempotency_key VARCHAR(96) NOT NULL,
  issued_at DATETIME NULL,
  fail_reason VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_invite_reward_idem (idempotency_key),
  KEY idx_invite_rewards_inviter (store_id, inviter_member_id, created_at),
  CONSTRAINT fk_invite_rewards_relation FOREIGN KEY (relation_id) REFERENCES invite_relations(id),
  CONSTRAINT fk_invite_rewards_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_invite_rewards_inviter FOREIGN KEY (inviter_member_id) REFERENCES members(id),
  CONSTRAINT fk_invite_rewards_invitee FOREIGN KEY (invitee_member_id) REFERENCES members(id),
  CONSTRAINT fk_invite_rewards_coupon FOREIGN KEY (reward_coupon_id) REFERENCES coupons(id)
) COMMENT='邀请奖励发放记录';

-- 6. 返现余额、店长等级与风控

CREATE TABLE wallet_accounts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  account_code VARCHAR(32) NOT NULL UNIQUE,
  store_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NOT NULL,
  available_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  frozen_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_earned_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_used_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status ENUM('active','frozen','closed') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_wallet_member_store (store_id, member_id),
  CONSTRAINT fk_wallet_accounts_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_wallet_accounts_member FOREIGN KEY (member_id) REFERENCES members(id)
) COMMENT='会员返现余额账户';

CREATE TABLE wallet_transactions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  transaction_code VARCHAR(32) NOT NULL UNIQUE,
  account_id BIGINT UNSIGNED NOT NULL,
  store_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NOT NULL,
  transaction_type ENUM('earn','spend','expire','refund','adjust','rollback') NOT NULL,
  source_type ENUM('order_cashback','invite_reward','coupon_verify','manual','system') NOT NULL,
  source_id VARCHAR(64) NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  status ENUM('pending','succeeded','failed','void') NOT NULL DEFAULT 'succeeded',
  idempotency_key VARCHAR(96) NOT NULL,
  expire_at DATETIME NULL,
  remark VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_wallet_idempotency (idempotency_key),
  KEY idx_wallet_member_created (member_id, created_at),
  KEY idx_wallet_source (source_type, source_id),
  CONSTRAINT fk_wallet_transactions_account FOREIGN KEY (account_id) REFERENCES wallet_accounts(id),
  CONSTRAINT fk_wallet_transactions_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_wallet_transactions_member FOREIGN KEY (member_id) REFERENCES members(id)
) COMMENT='余额收入、抵扣、过期、回滚流水';

CREATE TABLE member_levels (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT UNSIGNED NOT NULL,
  level_code VARCHAR(32) NOT NULL,
  level_name VARCHAR(64) NOT NULL,
  level_rank TINYINT UNSIGNED NOT NULL,
  required_verified_invites INT UNSIGNED NOT NULL DEFAULT 0,
  required_poster_saves INT UNSIGNED NOT NULL DEFAULT 0,
  benefits JSON NULL,
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_member_level_store_code (store_id, level_code),
  CONSTRAINT fk_member_levels_store FOREIGN KEY (store_id) REFERENCES stores(id)
) COMMENT='店长等级配置';

CREATE TABLE member_level_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NOT NULL,
  from_level_code VARCHAR(32) NULL,
  to_level_code VARCHAR(32) NOT NULL,
  reason VARCHAR(128) NOT NULL,
  snapshot JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_member_level_logs_member (member_id, created_at),
  CONSTRAINT fk_member_level_logs_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_member_level_logs_member FOREIGN KEY (member_id) REFERENCES members(id)
) COMMENT='会员等级变更记录';

CREATE TABLE risk_events (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  risk_code VARCHAR(32) NOT NULL UNIQUE,
  store_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NULL,
  event_type ENUM('duplicate_coupon','self_invite','invite_conflict','verify_race','wallet_conflict','ai_abuse','other') NOT NULL,
  severity ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  status ENUM('open','ignored','resolved') NOT NULL DEFAULT 'open',
  payload JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  KEY idx_risk_store_status (store_id, status, created_at),
  KEY idx_risk_member (member_id, created_at),
  CONSTRAINT fk_risk_events_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_risk_events_member FOREIGN KEY (member_id) REFERENCES members(id)
) COMMENT='风控事件表';

-- 7. 商家操作员与后台

CREATE TABLE operators (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  operator_code VARCHAR(32) NOT NULL UNIQUE,
  store_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(64) NOT NULL,
  phone VARCHAR(32) NULL,
  role ENUM('owner','manager','staff') NOT NULL DEFAULT 'staff',
  password_hash VARCHAR(255) NULL COMMENT '如使用账号密码登录',
  openid VARCHAR(96) NULL COMMENT '如使用微信登录商家端',
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_operators_store (store_id),
  CONSTRAINT fk_operators_store FOREIGN KEY (store_id) REFERENCES stores(id)
) COMMENT='商家端操作员表';

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT UNSIGNED NULL,
  operator_id BIGINT UNSIGNED NULL,
  member_id BIGINT UNSIGNED NULL,
  action VARCHAR(64) NOT NULL,
  target_type VARCHAR(64) NULL,
  target_id VARCHAR(64) NULL,
  request_id VARCHAR(64) NULL,
  ip VARCHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  payload JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_store_created (store_id, created_at),
  KEY idx_audit_action_created (action, created_at)
) COMMENT='审计日志表';

-- 8. 事件与统计

CREATE TABLE tracking_events (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  event_code VARCHAR(32) NOT NULL UNIQUE,
  store_id BIGINT UNSIGNED NOT NULL,
  member_id BIGINT UNSIGNED NULL,
  table_id BIGINT UNSIGNED NULL,
  event_type ENUM(
    'scan',
    'login',
    'coupon_issue',
    'coupon_verify',
    'ai_text',
    'ai_image',
    'poster_generate',
    'poster_save',
    'group_click',
    'invite_bind',
    'wallet_earn',
    'wallet_spend',
    'level_upgrade',
    'risk_event'
  ) NOT NULL,
  event_payload JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_events_store_type_time (store_id, event_type, created_at),
  KEY idx_events_member_time (member_id, created_at),
  CONSTRAINT fk_events_store FOREIGN KEY (store_id) REFERENCES stores(id),
  CONSTRAINT fk_events_member FOREIGN KEY (member_id) REFERENCES members(id),
  CONSTRAINT fk_events_table FOREIGN KEY (table_id) REFERENCES store_tables(id)
) COMMENT='埋点事件表';

CREATE TABLE daily_store_stats (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT UNSIGNED NOT NULL,
  stat_date DATE NOT NULL,
  scan_count INT UNSIGNED NOT NULL DEFAULT 0,
  new_member_count INT UNSIGNED NOT NULL DEFAULT 0,
  coupon_issue_count INT UNSIGNED NOT NULL DEFAULT 0,
  coupon_verify_count INT UNSIGNED NOT NULL DEFAULT 0,
  ai_text_count INT UNSIGNED NOT NULL DEFAULT 0,
  ai_image_count INT UNSIGNED NOT NULL DEFAULT 0,
  poster_count INT UNSIGNED NOT NULL DEFAULT 0,
  group_join_click_count INT UNSIGNED NOT NULL DEFAULT 0,
  invite_bind_count INT UNSIGNED NOT NULL DEFAULT 0,
  new_customer_verified_count INT UNSIGNED NOT NULL DEFAULT 0,
  ai_cost_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  order_amount_sum DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  discount_amount_sum DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_daily_store (store_id, stat_date),
  CONSTRAINT fk_daily_stats_store FOREIGN KEY (store_id) REFERENCES stores(id)
) COMMENT='门店日统计表';

-- 9. AI 配额与配置

CREATE TABLE store_ai_quotas (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  store_id BIGINT UNSIGNED NOT NULL,
  quota_month CHAR(7) NOT NULL COMMENT 'YYYY-MM',
  text_quota INT UNSIGNED NOT NULL DEFAULT 1000,
  image_quota INT UNSIGNED NOT NULL DEFAULT 500,
  video_quota INT UNSIGNED NOT NULL DEFAULT 0,
  text_used INT UNSIGNED NOT NULL DEFAULT 0,
  image_used INT UNSIGNED NOT NULL DEFAULT 0,
  video_used INT UNSIGNED NOT NULL DEFAULT 0,
  cost_limit DECIMAL(10,2) NOT NULL DEFAULT 500.00,
  cost_used DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_store_quota_month (store_id, quota_month),
  CONSTRAINT fk_ai_quotas_store FOREIGN KEY (store_id) REFERENCES stores(id)
) COMMENT='门店 AI 月度配额表';

CREATE TABLE prompt_templates (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  template_code VARCHAR(64) NOT NULL UNIQUE,
  template_name VARCHAR(128) NOT NULL,
  task_type ENUM('text','image','poster','video') NOT NULL,
  version VARCHAR(32) NOT NULL,
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL,
  status ENUM('active','disabled') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='提示词模板版本表';

-- 10. 初始化建议数据

INSERT INTO merchants (merchant_code, merchant_name, contact_name, plan_level)
VALUES ('MCH_NLNQ_001', '牛里牛气潮汕牛肉火锅', '老板', 'standard');

INSERT INTO stores (
  store_code,
  merchant_id,
  store_name,
  slogan,
  brand_keywords,
  poster_template
)
SELECT
  'STORE001',
  id,
  '牛里牛气潮汕牛肉火锅',
  '吃肉的人终会相遇',
  JSON_ARRAY('潮汕牛肉火锅', '05后女生老板', '肉好实惠', '位置偏但值得来'),
  'hotpot_standard'
FROM merchants
WHERE merchant_code = 'MCH_NLNQ_001';

INSERT INTO coupon_templates (
  store_id,
  template_code,
  coupon_type,
  title,
  description,
  discount_rate,
  min_amount,
  validity_days
)
SELECT
  id,
  'BASE_DAILY_85',
  'base',
  '今日吃肉券',
  '到店堂食可享 85 折，具体以门店规则为准',
  0.85,
  0.00,
  1
FROM stores
WHERE store_code = 'STORE001';

INSERT INTO coupon_templates (
  store_id,
  template_code,
  coupon_type,
  title,
  description,
  gift_name,
  min_amount,
  validity_days
)
SELECT
  id,
  'REWARD_MEAT',
  'reward',
  '老客奖励券',
  '邀请新客到店核销后发放',
  '手切嫩肉一份',
  0.00,
  14
FROM stores
WHERE store_code = 'STORE001';
