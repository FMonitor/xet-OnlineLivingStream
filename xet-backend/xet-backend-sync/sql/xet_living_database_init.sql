CREATE DATABASE IF NOT EXISTS xet_living_table;
USE xet_living_table;
-- 修改数据库字符集
ALTER DATABASE xet_living_table CHARACTER SET utf8 ;

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

-- 修改所有表的字符集
ALTER TABLE users CONVERT TO CHARACTER SET utf8;
ALTER TABLE living_stream CONVERT TO CHARACTER SET utf8;
ALTER TABLE user_living_stream CONVERT TO CHARACTER SET utf8;
ALTER TABLE live_comment CONVERT TO CHARACTER SET utf8;
ALTER TABLE live_explanation CONVERT TO CHARACTER SET utf8;
ALTER TABLE live_file CONVERT TO CHARACTER SET utf8;

-- 添加示例用户
INSERT INTO users (username, password, email, avatar_url) VALUES 
('user1', 'password123', 'user1@example.com', 'http://lcmonitor.dynv6.net/file/0.svg'),
('user2', 'password456', 'user2@example.com', 'http://lcmonitor.dynv6.net/file/user_avatar_2.svg'),
('user3', 'password789', 'user3@example.com', 'http://lcmonitor.dynv6.net/file/user_avatar_3.svg');

-- 添加示例直播信息
INSERT INTO living_stream (creator_user_id, description, playback_url) VALUES 
(1, '这是第一个直播间的介绍', 'https://lcmonitor.dynv6.net/file/video1.mp4'),
(2, '这是第二个直播间的介绍', 'http://lcmonitor.dynv6.net/file/video2.mp4');

-- 添加用户与直播关系
INSERT INTO user_living_stream (user_id, living_stream_id) VALUES 
(1, 1), -- user1拥有直播1
(1, 2), -- user1也拥有直播2
(2, 2), -- user2拥有直播2
(3, 1); -- user3拥有直播1

-- 为每个直播添加文件信息
INSERT INTO live_file (living_stream_id, creator_user_id, file_url) VALUES 
(1, 2, 'https://lcmonitor.dynv6.net/file/playlist_live.m3u8'),
(2, 2, 'https://lcmonitor.dynv6.net/file/playlist_live.m3u8');

-- 为每个直播添加评论信息
INSERT INTO live_comment (living_stream_id, creator_user_id, content) VALUES 
(1, 1, 'comment1'),
(1, 2, 'comment2'),
(1, 3, 'comment3'),
(1, 1, 'comment4'),
(1, 2, 'comment5'),
(1, 3, 'comment6'),
(1, 1, 'comment7'),
(1, 2, 'comment8'),
(1, 3, 'comment9'),
(1, 1, 'comment10'),
(1, 2, 'comment11'),
(1, 3, 'comment12'),
(1, 1, 'comment13'),
(1, 2, 'comment14'),
(1, 3, 'comment15'),
(1, 1, 'comment16'),
(1, 2, 'comment17'),
(1, 3, 'comment18'),
(1, 1, 'comment19'),
(1, 2, 'comment20'),
(1, 3, 'comment21'),
(1, 1, 'comment22'),
(1, 2, 'comment23'),
(1, 3, 'comment24'),
(1, 1, 'comment25'),
(1, 2, 'comment26'),
(1, 3, 'comment27'),
(1, 1, 'comment28'),
(1, 2, 'comment29'),
(1, 3, 'comment30');
-- 为每个直播添加讲解信息
INSERT INTO live_explanation (living_stream_id, creator_user_id, content) VALUES 
(1, 2, 'explanation1'),
(1, 3, 'explanation2'),
(1, 1, 'explanation3'),
(1, 2, 'explanation4'),
(1, 3, 'explanation5'),
(1, 1, 'explanation6'),
(1, 2, 'explanation7'),
(1, 3, 'explanation8'),
(1, 1, 'explanation9'),
(1, 2, 'explanation10');