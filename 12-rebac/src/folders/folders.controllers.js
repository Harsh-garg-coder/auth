import { createFolder, findFolderById } from "./folders.repository.js";
import { findUserByEmail } from "../auth/auth.repository.js";
import { check, writeTuple } from "../rebac/rebac.repository.js";

export const createFolderController = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "name is required!" });
    }

    const folder = await createFolder(name);

    // owner relation tuple — folder:X #owner @user:U
    await writeTuple("folder", folder.id, "owner", "user", req.user_id);

    res.status(201).json({ id: folder.id, name: folder.name });
};

// ⭐ THE killer: folder share karte hi andar ke saare posts ka access inherit
// ho jata hai — ek hi tuple, koi per-post row nahi
export const shareFolderController = async (req, res) => {
    const folderId = Number(req.params.id);
    const { email, relation } = req.body;

    if (!["viewer", "editor", "owner"].includes(relation)) {
        return res.status(400).json({ error: "Invalid relation" });
    }

    const folder = await findFolderById(folderId);
    if (!folder) {
        return res.status(404).json({ error: "Folder not found!" });
    }

    // sirf folder owner share kar sakta hai
    const isOwner = await check("folder", folderId, "owner", req.user_id);
    if (!isOwner) {
        return res.status(403).json({ error: "Only owner can share" });
    }

    const targetUser = await findUserByEmail(email);
    if (!targetUser) {
        return res.status(404).json({ error: "User to share with not found" });
    }

    await writeTuple("folder", folderId, relation, "user", targetUser.id);
    res.status(200).json({ message: `Granted folder '${relation}' to ${email}` });
};
