import { query } from "../db/index.js";

export const createPost = async (title, content, userId, department, status) => {
    const result = await query(
        "INSERT INTO posts (title, content, user_id, department, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [title, content, userId, department, status]
    );
    return result.rows[0];
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