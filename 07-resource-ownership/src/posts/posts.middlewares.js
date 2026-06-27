import { findPostById } from "./posts.repository.js";
import { findUserById } from "../auth/auth.repository.js";

export const requireOwnership = async (req, res, next) => {
    const postId = req.params.id;

    const post = await findPostById(postId);
    req.post = post;

    if(!post) {
        return res.status(404).json({ error: "Post not found!"});
    }

    const userId = req.user_id;
    const user = await findUserById(userId);
    req.user = user;

    if(user.role === "admin") {
        req.role = "admin";
        return next();
    }

    if(post.user_id !== userId) {
        return res.status(403).json({ error: "Forbidden!"});
    }

    next();
};