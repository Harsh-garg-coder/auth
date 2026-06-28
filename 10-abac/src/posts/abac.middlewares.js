import { findPostById } from "./posts.repository.js";
import { findUserById } from "../auth/auth.repository.js";
import { can } from "./abac.policies.js";

const isDev = process.env.NODE_ENVIRONMENT === "dev";

// environment attribute: current hour.
// dev me test ke liye `x-test-hour` header se override (warna real clock).
const getCurrentHour = (req) => {
    const override = req.headers["x-test-hour"];
    if (isDev && override !== undefined) {
        return Number(override);
    }
    return new Date().getHours();
};

export const requirePolicy = (action) => {
    return async (req, res, next) => {
        // RESOURCE attributes — post fetch
        const post = await findPostById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found!" });
        }
        req.post = post;   // controller dobara fetch na kare

        // SUBJECT attributes — user fetch (department waghairah)
        const user = await findUserById(req.user_id);

        // ENVIRONMENT attributes
        const env = { hour: getCurrentHour(req) };

        // policy engine se decision
        const decision = can(action, user, post, env);
        if (!decision.allow) {
            return res.status(403).json({ error: "Forbidden", reason: decision.reason });
        }

        next();
    };
};
