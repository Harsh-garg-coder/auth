-- insert roles
INSERT INTO roles (name) VALUES 
('User'), ('Editor'), ('Admin')
ON CONFLICT DO NOTHING;

-- insert permissions
INSERT INTO permissions (name) VALUES 
('post:create'), 
('post:read:any'), 
('post:delete:own'),
('post:update:own'),
('post:update:any'),
('post:delete:any')
ON CONFLICT DO NOTHING;

-- insert roles and permissions mapping
-- User role and its permissions mapping
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id 
FROM roles r 
JOIN permissions p ON p.name IN 
(
    'post:create',
    'post:read:any',
    'post:update:own',
    'post:delete:own'
)
WHERE r.name = 'User'
ON CONFLICT DO NOTHING;

-- Editor role and its permissions mapping
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r 
JOIN permissions p ON p.name IN 
(
    'post:create',
    'post:read:any',
    'post:update:own',
    'post:delete:own',
    'post:update:any'
)
WHERE r.name = 'Editor'
ON CONFLICT DO NOTHING;

-- Admin role and its permissions mapping
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r 
JOIN permissions p ON p.name IN 
(
    'post:create',
    'post:read:any',
    'post:update:own',
    'post:delete:own',
    'post:update:any',
    'post:delete:any'
)
WHERE r.name = 'Admin'
ON CONFLICT DO NOTHING;
