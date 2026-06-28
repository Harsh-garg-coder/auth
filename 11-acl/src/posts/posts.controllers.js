import { createPost, deletePost, findPostById, grantPermission, updatePost } from "./posts.repository.js";
import { findUserByEmail } from "../auth/auth.repository.js";

export const createPostController = async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: "title and content is required!" });
    }

    const post = await createPost(title, content, req.user_id);

    // ⭐ owner ko poori access-list me daal do (read/update/delete)
    // ACL "pure" rakhne ke liye owner bhi bas list ki entries hai — koi special-case nahi
    await Promise.all([
        grantPermission(post.id, req.user_id, "read"),
        grantPermission(post.id, req.user_id, "update"),
        grantPermission(post.id, req.user_id, "delete"),
    ]);

    res.status(201).json({ id: post.id, title: post.title, content: post.content });
};

export const getPostController = async (req, res) => {
    // requireAcl("read") ne post fetch + verify kar liya → req.post available
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

// owner kisi aur user ko ek permission grant kare (Google Doc "share" jaisa)
export const shareController = async (req, res) => {
    const post = await findPostById(req.params.id);
    if (!post) {
        return res.status(404).json({ error: "Post not found!" });
    }

    const { email, permission } = req.body;

    // sirf OWNER share kar sakta hai (sharing ek privileged action hai)
    if (post.user_id !== req.user_id) {
        return res.status(403).json({ error: "Only owner can share" });
    }

    if (!["read", "update", "delete"].includes(permission)) {
        return res.status(400).json({ error: "Invalid permission" });
    }

    const targetUser = await findUserByEmail(email);
    if (!targetUser) {
        return res.status(404).json({ error: "User to share with not found" });
    }

    await grantPermission(post.id, targetUser.id, permission);
    res.status(200).json({ message: `Granted '${permission}' to ${email}` });
};
