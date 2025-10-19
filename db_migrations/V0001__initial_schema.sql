-- GBWhatsApps database schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours'
);

-- Story views table
CREATE TABLE IF NOT EXISTS story_views (
    id SERIAL PRIMARY KEY,
    story_id INTEGER REFERENCES stories(id),
    viewer_id INTEGER REFERENCES users(id),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(story_id, viewer_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);

-- Insert sample verified users
INSERT INTO users (email, password_hash, username, display_name, bio, avatar_url, is_verified, last_seen) VALUES
('admin@gbwhatsapps.ru', '$2a$10$example', 'gbwhatsapps_official', 'GBWhatsApps', 'Официальный аккаунт GBWhatsApps 🚀', 'https://api.dicebear.com/7.x/avataaars/svg?seed=official', TRUE, CURRENT_TIMESTAMP),
('anna@example.ru', '$2a$10$example', 'anna_designer', 'Анна Иванова', 'UI/UX дизайнер | Москва 🎨', 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna', TRUE, CURRENT_TIMESTAMP - INTERVAL '5 minutes'),
('dmitry@example.ru', '$2a$10$example', 'dmitry_dev', 'Дмитрий Смирнов', 'Full-stack разработчик 💻', 'https://api.dicebear.com/7.x/avataaars/svg?seed=dmitry', FALSE, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('maria@example.ru', '$2a$10$example', 'maria_photo', 'Мария Петрова', 'Фотограф | Путешествия 📸', 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', TRUE, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
('alex@example.ru', '$2a$10$example', 'alex_blogger', 'Алексей Волков', 'Блогер | Технологии ⚡', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', FALSE, CURRENT_TIMESTAMP - INTERVAL '30 minutes');