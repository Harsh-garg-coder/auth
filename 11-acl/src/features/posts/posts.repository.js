import { query } from "../../db/index.js";

export const createPost = async (title, content, userId) => {
    const result = await query(
        "INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *",
        [title, content, userId]
    );
    return result.rows[0];
}

export const grantPermission = async (postId, userId, permission) => {
    const result = await query(
        `INSERT INTO post_permissions (post_id, user_id, permission)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [postId, userId, permission]
    );
    return result.rowCount;
}

export const hasPermission = async (postId, userId, permission) => {
    const result = await query(
        `SELECT 1 FROM post_permissions
         WHERE post_id = $1 AND user_id = $2 AND permission = $3`,
        [postId, userId, permission]
    );
    return result.rowCount > 0;
}

export const findPostById = async (postId) => {
    const result = await query("SELECT * FROM posts WHERE id = $1", [postId]);
    return result.rows[0];
}

export const updatePost = async (postId, title, content) => {
    let queryString = "UPDATE posts SET ";
    const values = [];
    let count = 1;

    if(title) {
        queryString += `title = $${count++} `;
        values.push(title);
    } 

    if(content) {
        if(count > 1) {
            queryString += ", ";
        }
        queryString += `content = $${count++} `;
        values.push(content);
    }

    queryString += `, updated_at = now() WHERE id = $${count++} RETURNING *`;
    values.push(postId);

    const result = await query(queryString, values);
    return result.rows[0];
}

export const deletePost = async (postId) => {
    const result = await query("DELETE FROM posts WHERE id = $1", [postId]);
    return result.rowCount;
}