import { verifyAccessToken } from "../helpers/tokens.helpers.js";
import { findUserById } from "./auth.repository.js";

export const requireAuth = (req, res, next) => {
    const { access_token } = req.cookies;

    const payload = verifyAccessToken(access_token);
    if(!payload) {
        return res.status(401).json({error: "Unauthenticated"});
    } else {
        req.user_id = payload?.id;
        next();
    }
}

export const requireRole = (...allowedRoles) => {
    return async (req, res, next) => {
        const user = await findUserById(req.user_id);

        if(!user) {
            return res.status(404).json({error: "User not found!"});
        }

        if(!allowedRoles.includes(user?.role)) {
            return res.status(403).json({error: "Forbidden"});
        }

        req.role = user.role;
        next();
    };
};