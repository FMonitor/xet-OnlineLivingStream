-- 创建数据库
CREATE DATABASE IF NOT EXISTS xet_living_table;
USE xet_living_table;

-- 创建用户信息存储表
CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY, -- 用户id 主键
    username VARCHAR(255) UNIQUE NOT NULL,  -- 用户名 唯一
    password VARCHAR(255) NOT NULL,         -- 用户密码
    email VARCHAR(255) NOT NULL,            -- 用户邮箱
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- 创建时间
);

-- 创建用户-直播关联表
CREATE TABLE user_living_stream (
    user_id INT NOT NULL,                   -- 用户id 外键
    living_stream_id INT NOT NULL,          -- 直播id 外键
    PRIMARY KEY (user_id, living_stream_id), -- 用户id-直播id 联合主键
    FOREIGN KEY (user_id) REFERENCES user(user_id), -- 外键关联用户表
    FOREIGN KEY (living_stream_id) REFERENCES living_stream(living_stream_id) -- 外键关联直播信息表
);

-- 创建直播信息表
CREATE TABLE living_stream (
    living_stream_id INT AUTO_INCREMENT PRIMARY KEY, -- 直播id 主键
    creator_user_id INT NOT NULL,                    -- 创建用户id 外键
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- 创建时间
    description TEXT,                                -- 简介
    playback_url VARCHAR(255),                      -- 回放地址
    FOREIGN KEY (creator_user_id) REFERENCES user(user_id) -- 外键关联用户表
);

-- 创建直播评论表
CREATE TABLE live_comment (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,      -- 评论id 主键
    living_stream_id INT NOT NULL,                  -- 直播id 外键
    creator_user_id INT NOT NULL,                   -- 创建用户id 外键
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
    content TEXT NOT NULL,                          -- 内容
    FOREIGN KEY (living_stream_id) REFERENCES living_stream(living_stream_id), -- 外键关联直播信息表
    FOREIGN KEY (creator_user_id) REFERENCES user(user_id) -- 外键关联用户表
);

-- 创建直播讲解表
CREATE TABLE live_expla (
    expla_id INT AUTO_INCREMENT PRIMARY KEY,        -- 评论id 主键
    living_stream_id INT NOT NULL,                  -- 直播id 外键
    creator_user_id INT NOT NULL,                   -- 创建用户id 外键
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
    content TEXT NOT NULL,                          -- 内容
    FOREIGN KEY (living_stream_id) REFERENCES living_stream(living_stream_id), -- 外键关联直播信息表
    FOREIGN KEY (creator_user_id) REFERENCES user(user_id) -- 外键关联用户表
);

-- 创建文件信息表
CREATE TABLE live_file (
    file_id INT AUTO_INCREMENT PRIMARY KEY,         -- 文件id 主键
    living_stream_id INT NOT NULL,                  -- 直播id 外键
    creator_user_id INT NOT NULL,                   -- 创建用户id 外键
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
    file_url VARCHAR(255) NOT NULL,                 -- 文件地址
    FOREIGN KEY (living_stream_id) REFERENCES living_stream(living_stream_id), -- 外键关联直播信息表
    FOREIGN KEY (creator_user_id) REFERENCES user(user_id) -- 外键关联用户表
);