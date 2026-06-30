import { query } from "../../db/index.js";

export const updateUser = async (isPremium, userId) => {
    let queryString = "UPDATE users SET";
    let index = 1;
    const values = [];

    if(isPremium !== undefined) {
        queryString += ` is_premium = $${index++}`;
        values.push(isPremium);
    }

    queryString += `, updated_at = now() WHERE id = $${index++} RETURNING *`;
    values.push(userId);

    const result = await query(queryString, values);
    return result.rows[0];
}