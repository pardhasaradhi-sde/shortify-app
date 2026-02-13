-- V2__create_short_urls_table.sql
-- PostgreSQL compatible migration

CREATE TABLE short_urls (
                            id UUID PRIMARY KEY,
                            short_code VARCHAR(10) UNIQUE NOT NULL,
                            original_url TEXT NOT NULL,
                            user_id UUID NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            expires_at TIMESTAMP NULL,
                            is_active BOOLEAN DEFAULT TRUE,
                            access_type VARCHAR(20) DEFAULT 'PUBLIC',

                            CONSTRAINT fk_short_url_user FOREIGN KEY (user_id)
                                REFERENCES users(id)
                                ON DELETE SET NULL
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_short_urls_short_code ON short_urls(short_code);
CREATE INDEX idx_short_urls_user_id ON short_urls(user_id);
CREATE INDEX idx_short_urls_expires_at ON short_urls(expires_at);
CREATE INDEX idx_short_urls_is_active ON short_urls(is_active);
CREATE INDEX idx_short_urls_created_at ON short_urls(created_at);
CREATE INDEX idx_short_urls_user_active ON short_urls(user_id, is_active);
