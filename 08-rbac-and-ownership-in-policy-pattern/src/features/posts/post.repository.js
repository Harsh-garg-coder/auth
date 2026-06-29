import { query } from "../../db/index.js"

export const createPost = async (title, content, userId) => {
    const result = await query(`
        INSERT INTO posts (title, content, user_id) VALUES ($1, $2, $3) RETURNING *
    `, [title, content, userId]);

    return result.rows[0];
}

export const getAllPosts = async () => {
    const result = await query(`
        SELECT * FROM posts
    `, []);

    return result.rows;
}

export const getPostById = async (postId) => {
    const result = await query(`
        SELECT * FROM posts WHERE id = $1
    `, [postId]);

    return result.rows[0];
}

export const updatePost = async (title, content, postId) => {
    let queryString = "UPDATE posts SET";
    let index = 1;
    const values = [];

    if(title) {
        queryString += ` title = $${index++}`;
        values.push(title);
    }

    if(content) {
        if(index !== 1) {
            queryString += `, `;
        }
        queryString += ` content = $${index++}`;
        values.push(content);
    }

    queryString += `, updated_at = now() WHERE id = $${index++} RETURNING *`;
    values.push(postId);

    const result = await query(queryString, values);
    return result.rows[0];
}

export const deletePost = async (postId) => {
    const result = await query("DELETE FROM posts WHERE id = $1 RETURNING *", [postId]);
    return result.rows[0];
}