import { query } from "../db/index.js";

export const findUserByEmail = async (email) => {
    const user = await query("SELECT * FROM users WHERE email = $1", [email]);

    return user.rows[0];
}

export const createUser = async (email, password) => {
    const user = await query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *", [email, password]);
    return user?.rows?.[0];
}

export const saveRefreshToken = async (refreshToken, id) => {
    const result = await query("INSERT INTO refresh_tokens (refresh_token, user_id) VALUES ($1, $2)", [refreshToken, id]);

    return result.rowCount;
}

export const findUserById = async (id) => {
    const user = await query("SELECT * FROM users WHERE id = $1", [id]);

    return user.rows[0];
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

export const getAllPermissionsOfUser = async (userId) => {
    const queryString = `
        WITH RECURSIVE effective_roles AS (
            -- anchor: user ke direct roles
            SELECT r.id
            FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = $1

          UNION

            -- recursive: jo roles ab tak mile, unke inherited roles add karo
            SELECT r.id
            FROM role_inherits ri
            JOIN effective_roles er ON er.id = ri.role_id
            JOIN roles r ON r.id = ri.inherits_role_id
        )
        SELECT DISTINCT p.name AS permission_name
        FROM effective_roles er
        JOIN role_permissions rp ON rp.role_id = er.id
        JOIN permissions p ON p.id = rp.permission_id
    `;

    const result = await query(queryString, [userId]);
    return result.rows.map((row) => row.permission_name);
}

export const assignRole = async (userId, roleName) => {
    const result = await query(
        `INSERT INTO user_roles (user_id, role_id)
         SELECT $1, id FROM roles WHERE name = $2
         ON CONFLICT DO NOTHING`,
        [userId, roleName]
    );
    return result.rowCount;
}

export const userHasRole = async (userId, roleName) => {
    const result = await query(
        `SELECT 1 FROM user_roles ur
         JOIN roles r ON r.id = ur.role_id
         WHERE ur.user_id = $1 AND r.name = $2`,
        [userId, roleName]
    );
    return result.rowCount > 0;
}

export const getUserRoles = async (userId) => {
    const result = await query(
        `SELECT r.name FROM user_roles ur
         JOIN roles r ON r.id = ur.role_id
         WHERE ur.user_id = $1`,
        [userId]
    );
    return result.rows.map((row) => row.name);
}

