-- Local bootstrap: keep Strapi's editorial data in a separate database from
-- Medusa's commerce data. PostgreSQL runs this file only on first initialization.
CREATE DATABASE dalizebo_cms;
GRANT ALL PRIVILEGES ON DATABASE dalizebo_cms TO dalizebo;
