import { verifyAccessToken } from "../helpers/tokens.helpers.js";
import { getAllPermissionsOfUser, getUserRoles } from "./auth.repository.js";

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
        const userRoles = await getUserRoles(req.user_id);

        const hasAny = userRoles.some((role) => allowedRoles.includes(role));
        if(!hasAny) {
            return res.status(403).json({error: "Forbidden"});
        }

        req.roles = userRoles;
        next();
    };
};

export const requirePermission = (permissionName) => {
    return async (req, res, next) => {
        const permissions = await getAllPermissionsOfUser(req.user_id);
        req.permissions = permissions;  

        if (!permissions.includes(permissionName)) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
};