CREATE DATABASE IF NOT EXISTS xet_living_table;
USE xet_living_table;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE living_stream (
    living_stream_id INT AUTO_INCREMENT PRIMARY KEY,
    creator_user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    playback_url VARCHAR(255),
    FOREIGN KEY (creator_user_id) REFERENCES users(user_id)
);

CREATE TABLE user_living_stream (
    user_id INT NOT NULL,
    living_stream_id INT NOT NULL,
    PRIMARY KEY (user_id, living_stream_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (living_stream_id) REFERENCES living_stream(living_stream_id)
);

CREATE TABLE live_comment (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    living_stream_id INT NOT NULL,
    creator_user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL,
    FOREIGN KEY (living_stream_id) REFERENCES living_stream(living_stream_id),
    FOREIGN KEY (creator_user_id) REFERENCES users(user_id)
);

CREATE TABLE live_explanation (
    expla_id INT AUTO_INCREMENT PRIMARY KEY,
    living_stream_id INT NOT NULL,
    creator_user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL,
    FOREIGN KEY (living_stream_id) REFERENCES living_stream(living_stream_id),
    FOREIGN KEY (creator_user_id) REFERENCES users(user_id)
);

CREATE TABLE live_file (
    file_id INT AUTO_INCREMENT PRIMARY KEY,
    living_stream_id INT NOT NULL,
    creator_user_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (living_stream_id) REFERENCES living_stream(living_stream_id),
    FOREIGN KEY (creator_user_id) REFERENCES users(user_id)
);

-- 添加示例用户
INSERT INTO users (username, password, email, avatar_url) VALUES 
('user1', 'password123', 'user1@example.com', 'http://localhost:8001/file/0.svg'),
('user2', 'password456', 'user2@example.com', 'http://localhost:8001/file/user_avatar_2.svg'),
('user3', 'password789', 'user3@example.com', 'http://localhost:8001/file/user_avatar_3.svg');

-- 添加示例直播信息
INSERT INTO living_stream (creator_user_id, description, playback_url) VALUES 
(1, '这是第一个直播间的介绍', 'http://localhost:8001/file/video1.mp4'),
(2, '这是第二个直播间的介绍', 'http://localhost:8001/file/video2.mp4');

-- 添加用户与直播关系
INSERT INTO user_living_stream (user_id, living_stream_id) VALUES 
(1, 1), -- user1拥有直播1
(1, 2), -- user1也拥有直播2
(2, 2), -- user2拥有直播2
(3, 1); -- user3拥有直播1

-- 为每个直播添加文件信息
INSERT INTO live_file (living_stream_id, creator_user_id, file_url) VALUES 
(1, 1, 'http://localhost:8001/file/playlist_live.m3u8'),
(2, 2, 'http://localhost:8001/file/playlist_live.m3u8');

-- 为每个直播添加评论信息
INSERT INTO live_comment (living_stream_id, creator_user_id, content) VALUES 
(1, 1, '直播1的第一条评论'),
(1, 2, '直播1的第二条评论'),
(1, 3, '直播1的第三条评论'),
(1, 1, '直播1的第四条评论'),
(2, 1, '直播2的第一条评论'),
(2, 2, '直播2的第二条评论'),
(2, 3, '直播2的第三条评论'),
(2, 1, '直播2的第四条评论');

-- 为每个直播添加讲解信息
INSERT INTO live_explanation (living_stream_id, creator_user_id, content) VALUES 
(1, 1, '直播1的第一条讲解'),
(1, 1, '直播1的第二条讲解'),
(2, 2, '直播2的第一条讲解'),
(2, 2, '直播2的第二条讲解');