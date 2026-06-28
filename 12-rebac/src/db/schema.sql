CREATE DATABASE rebac;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
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

-- folders: posts inke andar reh sakte hain (parent resource)
CREATE TABLE IF NOT EXISTS folders (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    -- post optionally kisi folder ke andar ho sakta hai (nullable)
    folder_id INT REFERENCES folders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- ============ ReBAC (Relationship-Based) — Google Zanzibar model ============
-- har row = ek RELATION TUPLE = graph ka ek edge
--   ⟨object_type:object_id⟩ # ⟨relation⟩ @ ⟨subject_type:subject_id⟩
-- examples:
--   folder:1 #owner  @user:5    → user 5 folder 1 ka owner
--   post:9   #parent @folder:1  → post 9 ka parent folder 1 (subject = folder, user nahi!)
--   post:9   #viewer @user:8    → user 8 post 9 ka direct viewer
-- permission STORE nahi hoti — relationships se TRAVERSE karke compute hoti hai
CREATE TABLE IF NOT EXISTS relation_tuples (
    id SERIAL PRIMARY KEY,
    object_type  TEXT NOT NULL,   -- 'post' | 'folder'
    object_id    INT  NOT NULL,
    relation     TEXT NOT NULL,   -- 'owner' | 'editor' | 'viewer' | 'parent'
    subject_type TEXT NOT NULL,   -- 'user' | 'folder'  (subject hamesha user nahi hota!)
    subject_id   INT  NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT now(),

    -- same edge dobara na bane (idempotency)
    UNIQUE (object_type, object_id, relation, subject_type, subject_id)
);
