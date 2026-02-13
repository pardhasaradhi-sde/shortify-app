-- V3__create_click_events_table.sql
-- PostgreSQL compatible migration for analytics events

CREATE TABLE click_events (
                              id UUID PRIMARY KEY,
                              short_url_id UUID NOT NULL,
                              clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              ip_address VARCHAR(45),
                              user_agent TEXT,
                              referrer TEXT,
                              country_code VARCHAR(2),
                              browser VARCHAR(50),
                              os VARCHAR(50),

                              CONSTRAINT fk_click_event_short_url
                                  FOREIGN KEY (short_url_id)
                                      REFERENCES short_urls(id)
                                      ON DELETE CASCADE
);

-- Analytics indexes
CREATE INDEX idx_click_events_url_time ON click_events(short_url_id, clicked_at);
CREATE INDEX idx_click_events_clicked_at ON click_events(clicked_at);
CREATE INDEX idx_click_events_country ON click_events(country_code);
CREATE INDEX idx_click_events_browser ON click_events(browser);
CREATE INDEX idx_click_events_os ON click_events(os);

-- TEXT indexing in Postgres (full column index)
CREATE INDEX idx_click_events_referrer ON click_events(referrer);
