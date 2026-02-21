-- V5__increase_short_code_length.sql

-- Increase the size limit of the short_code column to support custom aliases up to 20 characters
ALTER TABLE short_urls ALTER COLUMN short_code TYPE VARCHAR(20);
