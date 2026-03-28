-- init-databases.sql

-- User Service Database
CREATE DATABASE "user-service";
-- İsteğe bağlı: Bu DB için özel kullanıcı oluşturmak isterseniz
-- CREATE USER "user-service" WITH PASSWORD '1234';
-- GRANT ALL PRIVILEGES ON DATABASE "user-service" TO "user-service";

-- Product Service Database
CREATE DATABASE "product-service";

-- Chat Service Database
CREATE DATABASE "chat-service";

-- Media Service Database
CREATE DATABASE "media-service";