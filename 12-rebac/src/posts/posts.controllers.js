import { createPost, deletePost, updatePost } from "./posts.repository.js";
import { findUserByEmail } from "../auth/auth.repository.js";
import { check, writeTuple } from "../rebac/rebac.repository.js";

export const createPostController = async (req, res) => {
    const { title, content, folderId } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: "title and content is required!" });
    }

    // agar folder me daal raha hai → us folder pe editor hona chahiye
    if (folderId) {
        const canWrite = await check("folder", folderId, "editor", req.user_id);
        if (!canWrite) {
            return res.status(403).json({ error: "You can't add posts to this folder" });
        }
    }

    const post = await createPost(title, content, req.user_id, folderId ?? null);

    // ⭐ owner relation tuple — post:X #owner @user:U
    await writeTuple("post", post.id, "owner", "user", req.user_id);

    // folder me hai to parent edge bhi — post:X #parent @folder:Y (inheritance ka bridge)
    if (folderId) {
        await writeTuple("post", post.id, "parent", "folder", folderId);
    }

    res.status(201).json({
        id: post.id,
        title: post.title,
        content: post.content,
        folderId: post.folder_id,
    });
};

export const getPostController = async (req, res) => {
    // requireRelation("read") ne post fetch + verify kar liya → req.post available
    const post = req.post;
    res.status(200).json({ id: post.id, title: post.title, content: post.content });
};

export const updatePostController = async (req, res) => {
    const postId = req.post.id;
    const { title, content } = req.body;

    if (!title && !content) {
        return res.status(400).json({ error: "Nothing to update!" });
    }

    const updatedPost = await updatePost(postId, title, content);
    res.status(200).json({ id: updatedPost.id, title: updatedPost.title, content: updatedPost.content });
};

export const deletePostController = async (req, res) => {
    const postId = req.post.id;
    await deletePost(postId);
    res.status(200).json({ message: "Post deleted successfully!" });
};

// owner kisi aur user ko ek relation grant kare (viewer/editor/owner)
// ye bas ek naya tuple likhna hai — post:X #relation @user:target
export const shareController = async (req, res) => {
    const postId = Number(req.params.id);
    const { email, relation } = req.body;

    if (!["viewer", "editor", "owner"].includes(relation)) {
        return res.status(400).json({ error: "Invalid relation" });
    }

    // sirf OWNER share kar sakta hai (sharing privileged action hai)
    const isOwner = await check("post", postId, "owner", req.user_id);
    if (!isOwner) {
        return res.status(403).json({ error: "Only owner can share" });
    }

    const targetUser = await findUserByEmail(email);
    if (!targetUser) {
        return res.status(404).json({ error: "User to share with not found" });
    }

    await writeTuple("post", postId, relation, "user", targetUser.id);
    res.status(200).json({ message: `Granted '${relation}' to ${email}` });
};
