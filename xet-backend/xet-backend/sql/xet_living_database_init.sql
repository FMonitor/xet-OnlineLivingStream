CREATE DATABASE IF NOT EXISTS xet_living_table;
USE xet_living_table;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
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