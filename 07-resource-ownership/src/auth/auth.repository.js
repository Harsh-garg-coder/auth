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