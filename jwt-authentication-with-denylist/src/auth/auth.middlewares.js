import jwt from "jsonwebtoken";
import { isDenylisted } from "../db/redis.js";

export const requireAuth = async (req, res, next) => {
    const { token } = req.cookies;

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // check whether the token is present in the denylist or not
        // if present return 401 else pass the control to the next handler
        if(await isDenylisted(payload.jti)) {
            return res.status(401).json({error: "Unauthenticated"});
        }
        req.userId = payload.id;
        req.jti = payload.jti;
        req.tokenExp = payload.exp;

        next();
    } catch(error) {
        return res.status(401).json({error: "Unauthenticated"});
    }
}