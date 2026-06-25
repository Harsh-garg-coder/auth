CREATE DATABASE jwt_authentication_with_denylist;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_At TIMESTAMPTZ DEFAULT now()
);