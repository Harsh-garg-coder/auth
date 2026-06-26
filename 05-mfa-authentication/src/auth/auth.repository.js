import { query } from "../db/index.js";

export const findUserByEmail = async (email) => {
    const user = await query("SELECT * FROM users WHERE email = $1", [email]);
    return user.rows[0];
};

export const createUser = async (email, password) => {
    const user = await query(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
        [email, password]
    );
    return user?.rows?.[0];
};

export const findUserById = async (id) => {
    const user = await query("SELECT * FROM users WHERE id = $1", [id]);
    return user.rows[0];
};

export const setMfaSecret = async (secret, userId) => {
    const result = await query("UPDATE users SET mfa_secret = $1 WHERE id = $2", [secret, userId]);
    return result.rowCount;
}

export const setMfaEnabled = async (userId, isEnabled) => {
    const result = await query("UPDATE users SET is_mfa_enabled = $1 WHERE id = $2", [isEnabled, userId]);
    return result.rowCount;
}