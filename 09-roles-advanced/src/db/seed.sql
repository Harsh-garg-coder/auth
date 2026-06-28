-- ============ ROLES ============
INSERT INTO roles (name) VALUES
    ('user'), ('editor'), ('admin'), ('moderator')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name) VALUES
    ('post:create'), ('post:update'), ('post:delete'),
    ('user:ban'), ('comment:moderate')
ON CONFLICT (name) DO NOTHING;


INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'user' AND p.name = 'post:create'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'editor' AND p.name IN ('post:update', 'post:delete')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name = 'user:ban'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'moderator' AND p.name = 'comment:moderate'
ON CONFLICT DO NOTHING;

INSERT INTO role_inherits (role_id, inherits_role_id)
SELECT a.id, b.id FROM roles a, roles b
WHERE a.name = 'editor' AND b.name = 'user'
ON CONFLICT DO NOTHING;

INSERT INTO role_inherits (role_id, inherits_role_id)
SELECT a.id, b.id FROM roles a, roles b
WHERE a.name = 'admin' AND b.name = 'editor'
ON CONFLICT DO NOTHING;
