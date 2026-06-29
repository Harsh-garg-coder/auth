import { verifyAccessToken } from "../../helpers/tokens.helpers.js";
import { getUserPermissions } from "./auth.repository.js";

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

export const requirePermissions = (permissions, mode = "all") => {
    return async (req, res, next) => {
        const userId = req.user_id;

        // get user permissions
        const userPermissions = await getUserPermissions(userId);


        const hasSomeMissingPermission = mode === "all" ? 
            permissions.some((permission) => !userPermissions.includes(permission)) :
            permissions.every((permission) => !userPermissions.includes(permission));

        if(hasSomeMissingPermission) {
            return res.status(403).json({error: "Forbidden"});
        }

        req.user_permissions = userPermissions;
        next();
    }
}