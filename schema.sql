/***********************************************************
 * 1. 字典表（固定选项）
 ***********************************************************/

-- 网盘类型字典表
CREATE TABLE IF NOT EXISTS netdisk_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,    -- 如 '阿里云盘'
    code TEXT UNIQUE NOT NULL     -- 如 'aliyun'
);

-- 资源分类字典表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL     -- 如 '电影', '4K资源'
);

-- 标签字典表
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL     -- 如 '热播', '完结'
);


/***********************************************************
 * 2. 核心资源表
 ***********************************************************/

CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    file_info TEXT,                           -- 资源文件详细清单（文本）
    category_id INTEGER,
    status INTEGER DEFAULT 0,                 -- 0:待审, 1:正常, 2:失效
    tg_msg_id INTEGER,                        -- Telegram 来源消息 ID
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);


/***********************************************************
 * 3. 网盘链接表（含有效性检查字段）
 ***********************************************************/

CREATE TABLE IF NOT EXISTS resource_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER NOT NULL,
    type_id INTEGER NOT NULL,
    share_url TEXT NOT NULL,
    share_password TEXT,                     -- 提取码
    sharer_name TEXT,                        -- 分享人
    file_size INTEGER DEFAULT 0,             -- 单位：字节
    remark TEXT,                             -- 链接备注
    last_checked_at DATETIME,                -- 上次存活检查时间
    is_valid INTEGER DEFAULT 1,              -- 1=有效, 0=失效
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES netdisk_types(id)
);


/***********************************************************
 * 4. 关联表与监控表
 ***********************************************************/

-- 资源与标签多对多关联
CREATE TABLE IF NOT EXISTS resource_tag_refs (
    resource_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (resource_id, tag_id),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 频道监控表
CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_name TEXT,
    username TEXT UNIQUE NOT NULL,
    last_msg_id INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 1
);


/***********************************************************
 * 5. 全文搜索支持（FTS5）
 ***********************************************************/

-- 独立 FTS 表，用于高速模糊搜索
CREATE VIRTUAL TABLE IF NOT EXISTS resources_fts USING fts5(
    title,
    description,
    resource_id UNINDEXED
);


/***********************************************************
 * 6. 自动化触发器 (Triggers)
 ***********************************************************/

-- A. 自动更新 updated_at（修复了死循环问题）
CREATE TRIGGER IF NOT EXISTS trg_resources_updated_at
AFTER UPDATE ON resources
FOR EACH ROW
WHEN NEW.updated_at <= OLD.updated_at
BEGIN
    UPDATE resources SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- B. 自动同步 FTS 索引：插入
CREATE TRIGGER IF NOT EXISTS trg_resources_insert_fts AFTER INSERT ON resources
BEGIN
    INSERT INTO resources_fts (resource_id, title, description) 
    VALUES (NEW.id, NEW.title, NEW.description);
END;

-- C. 自动同步 FTS 索引：更新
CREATE TRIGGER IF NOT EXISTS trg_resources_update_fts AFTER UPDATE ON resources
BEGIN
    UPDATE resources_fts 
    SET title = NEW.title, 
        description = NEW.description 
    WHERE resource_id = NEW.id;
END;

-- D. 自动同步 FTS 索引：删除
CREATE TRIGGER IF NOT EXISTS trg_resources_delete_fts AFTER DELETE ON resources
BEGIN
    DELETE FROM resources_fts WHERE resource_id = OLD.id;
END;


/***********************************************************
 * 7. 性能索引
 ***********************************************************/

CREATE INDEX IF NOT EXISTS idx_res_status_time ON resources(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_link_res_id ON resource_links(resource_id);
CREATE INDEX IF NOT EXISTS idx_link_is_valid ON resource_links(is_valid); -- 方便快速过滤有效链接
CREATE INDEX IF NOT EXISTS idx_res_cat_status ON resources(category_id, status);