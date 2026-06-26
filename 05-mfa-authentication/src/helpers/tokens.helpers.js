import jwt from "jsonwebtoken";

export const createAccessToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
    });
};

export const verifyAccessToken = (accessToken) => {
    try {
        return jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, {
            algorithms: ["HS256"],
        });
    } catch (error) {
        return null;
    }
};

export const createMfaToken = (id) => {
    return jwt.sign({ id }, process.env.MFA_TOKEN_SECRET, {
        expiresIn: "5m",
    });
};

export const verifyMfaToken = (mfaToken) => {
    try {
        return jwt.verify(mfaToken, process.env.MFA_TOKEN_SECRET, {
            algorithms: ["HS256"],
        });
    } catch (error) {
        return null;
    }
};
