import { query } from "../db/index.js";

export const findUserByEmail = async (email) => {
    const users = await query("SELECT * FROM users WHERE email = $1", [email]);

    return users?.rows?.[0];
}

export const findUserById = async (id) => {
    const users = await query("SELECT * FROM users WHERE id = $1", [id]);

    return users?.rows?.[0];
}

export const createUser = async (email, password) => {
    const result = await query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *", [email, password]);
    
    return result?.rows?.[0];
}