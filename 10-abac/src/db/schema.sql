CREATE DATABASE abac;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    refresh_token TEXT UNIQUE NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMPTZ,

    FOREIGN KEY(user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    department TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);
-- NOTE: ABAC module — RBAC tables (roles/permissions/user_roles/role_permissions/
-- role_inherits) hata diye. Yahan authz attributes (department/status) + policy engine se hota hai.
