import { findPostById } from "../posts/posts.repository.js";
import { check } from "./rebac.repository.js";

// action -> required relation (read=viewer, update=editor, delete=owner)
const ACTION_RELATION = {
    read: "viewer",
    update: "editor",
    delete: "owner",
};

// ReBAC gate: kya current user post pe ye action kar sakta hai?
// decision check() engine se aata hai (direct + implied + inherited)
export const requireRelation = (action) => {
    return async (req, res, next) => {
        const relation = ACTION_RELATION[action];
        if (!relation) {
            return res.status(500).json({ error: `Unknown action: ${action}` });
        }

        const post = await findPostById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found!" });
        }
        req.post = post; // controller dobara fetch na kare

        // ⭐ pura authz decision recursive graph walk se
        const allowed = await check("post", post.id, relation, req.user_id);
        if (!allowed) {
            return res.status(403).json({ error: "Forbidden" });
        }

        next();
    };
};
