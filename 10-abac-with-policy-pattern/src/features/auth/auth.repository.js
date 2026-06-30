import { query } from "../../db/index.js";

export const findUserByEmail = async (email) => {
    const user = await query("SELECT * FROM users WHERE email = $1", [email]);

    return user.rows[0];
}

export const createUser = async (email, password) => {
    const user = await query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *", [email, password]);
    return user?.rows?.[0];
}

export const assignRole = async (userId, roleName) => {
    const result = await query(`
        INSERT INTO user_roles
        SELECT $1, r.id
        FROM roles r
        WHERE r.name = $2 
        ON CONFLICT DO NOTHING 
        RETURNING *
    `, [userId, roleName]);
    return result.rows[0];
}

export const saveRefreshToken = async (refreshToken, id) => {
    const result = await query("INSERT INTO refresh_tokens (refresh_token, user_id) VALUES ($1, $2)", [refreshToken, id]);

    return result.rowCount;
}

export const findUserById = async (id) => {
    const user = await query("SELECT * FROM users WHERE id = $1", [id]);

    return user.rows[0];
}

export const getUserRoles = async (userId) => {
    const result = await query(`
        SELECT r.name 
        FROM user_roles ur
        LEFT JOIN roles r
        ON r.id = ur.role_id
        WHERE ur.user_id = $1
    `, [userId])
    return result.rows.map((role) => role.name);
}

export const findRefreshToken = async (refreshToken) => {
    const result = await query("SELECT * FROM refresh_tokens WHERE refresh_token = $1", [refreshToken]);

    return result?.rows?.[0]
}

export const revokeRefreshToken = async (refreshToken) => {
    const result = await query("UPDATE refresh_tokens SET is_revoked = true WHERE refresh_token = $1", [refreshToken]);
    return result?.rowCount;
}

export const revokeAllRefreshToken = async (userId) => {
    const result = await query("UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1", [userId]);
    return result.rowCount;
}

export const getUserPermissions = async (userId) => {
    const result = await query(`
        WITH RECURSIVE role_tree AS (
            -- anchor: user ke direct roles
            SELECT ur.role_id
            FROM user_roles ur
            WHERE ur.user_id = $1

            UNION

            -- recurse: tree me maujood roles ke children (descendants)
            SELECT rh.child_role_id
            FROM role_hierarchy rh
            JOIN role_tree rt ON rh.parent_role_id = rt.role_id
        )
        SELECT DISTINCT p.name
        FROM role_tree rt
        JOIN role_permissions rp ON rp.role_id = rt.role_id
        JOIN permissions p ON p.id = rp.permission_id
    `, [userId]);

    return result.rows.map(permission => permission.name);
}