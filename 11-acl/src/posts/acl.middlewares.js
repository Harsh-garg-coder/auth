import { findPostById, hasPermission } from "./posts.repository.js";

// ACL check: kya current user ki is post pe `permission` ki entry list me hai?
export const requireAcl = (permission) => {
    return async (req, res, next) => {
        const post = await findPostById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found!" });
        }
        req.post = post;   // controller dobara fetch na kare

        // ⭐ pura authz decision ek hi lookup — list me entry hai ya nahi
        const allowed = await hasPermission(post.id, req.user_id, permission);
        if (!allowed) {
            return res.status(403).json({ error: "Forbidden" });
        }

        next();
    };
};
