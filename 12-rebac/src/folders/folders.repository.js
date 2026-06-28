import { query } from "../db/index.js";

export const createFolder = async (name) => {
    const result = await query(
        "INSERT INTO folders (name) VALUES ($1) RETURNING *",
        [name]
    );
    return result.rows[0];
};

export const findFolderById = async (folderId) => {
    const result = await query("SELECT * FROM folders WHERE id = $1", [folderId]);
    return result.rows[0];
};
