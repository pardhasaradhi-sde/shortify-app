-- V4__create_url_metadata_table.sql
-- PostgreSQL-compatible migration for URL metadata

CREATE TABLE url_metadata (
                              id UUID PRIMARY KEY,
                              short_url_id UUID NOT NULL UNIQUE,
                              title VARCHAR(500),
                              description TEXT,
                              thumbnail_url TEXT,
                              category VARCHAR(100),
                              favicon_url TEXT,
                              site_name VARCHAR(255),
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                              CONSTRAINT fk_url_metadata_short_url
                                  FOREIGN KEY (short_url_id)
                                      REFERENCES short_urls(id)
                                      ON DELETE CASCADE
);

-- Indexes
CREATE UNIQUE INDEX idx_url_metadata_short_url_id
    ON url_metadata(short_url_id);

CREATE INDEX idx_url_metadata_category
    ON url_metadata(category);

-- PostgreSQL full-text search index (replacement for MySQL FULLTEXT)
CREATE INDEX idx_url_metadata_search
    ON url_metadata
    USING GIN (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')));
