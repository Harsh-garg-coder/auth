import { verifyAccessToken } from "../../helpers/tokens.helpers.js";
import { findUserById, getUserPermissions } from "./auth.repository.js";

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

export const authorize = (policy, loadResource, loadContext) => {
    return async (req, res, next) => {
        const userId = req.user_id;
        const userPermissions = await getUserPermissions(userId);
        const userDetails = await findUserById(userId);

        const user = {
            ...userDetails,
            permissions: userPermissions,
        }

        let resource = null;
        if(loadResource) {
            resource = await loadResource(req);
            if(!resource) {
                return res.status(404).json({ error: "Not found" });
            }
            req.resource = resource;
        }

        let context = null;
        if(loadContext) {
            context = await loadContext(req);
            req.context = context;
        }

        const isAllowed = policy(user, resource, context);
        if(!isAllowed) {
            return res.status(403).json({ error: "forbidden" });
        }

        next();
    }
}