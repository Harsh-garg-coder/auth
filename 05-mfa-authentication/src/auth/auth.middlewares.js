import { verifyAccessToken } from "../helpers/tokens.helpers.js";

export const requireAuth = (req, res, next) => {
    const { access_token } = req.cookies;

    const payload = verifyAccessToken(access_token);
    if (!payload) {
        return res.status(401).json({ error: "Unauthenticated" });
    }

    req.user_id = payload.id;
    next();
};
