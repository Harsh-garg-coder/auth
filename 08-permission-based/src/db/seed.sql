INSERT INTO permissions (name) VALUES
    ('post:create'), ('post:update'), ('post:delete')
ON CONFLICT (name) DO NOTHING;

-- admin → sab; editor → create+update+delete; user → sirf create
INSERT INTO role_permissions (role_name, permission_id)
SELECT 'admin', id FROM permissions
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_name, permission_id)
SELECT 'editor', id FROM permissions WHERE name IN ('post:create','post:update','post:delete')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_name, permission_id)
SELECT 'user', id FROM permissions WHERE name = 'post:create'
ON CONFLICT DO NOTHING;