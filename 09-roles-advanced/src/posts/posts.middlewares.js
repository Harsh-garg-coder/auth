import { findPostById } from "./posts.repository.js";
import { userHasRole } from "../auth/auth.repository.js";

export const requireOwnership = async (req, res, next) => {
    const postId = req.params.id;

    const post = await findPostById(postId);
    req.post = post;

    if(!post) {
        return res.status(404).json({ error: "Post not found!"});
    }

    const userId = req.user_id;

    if(await userHasRole(userId, "admin")) {
        return next();
    }

    if(post.user_id !== userId) {
        return res.status(403).json({ error: "Forbidden!"});
    }

    next();
};