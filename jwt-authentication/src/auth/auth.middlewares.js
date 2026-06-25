import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
    const { token } = req.cookies;

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.id;
        next();
    } catch(error) {
        return res.status(401).json({error: "Unauthenticated"});
    }
}