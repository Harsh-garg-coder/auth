import jwt from "jsonwebtoken";

export const createAccessToken = (id) => {
    const accessToken = jwt.sign({
        id: id
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });

    return accessToken;
}

export const createRefreshToken = (id) => {
    const refreshToken = jwt.sign({
        id: id,
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });

    return refreshToken;
}

export const verifyAccessToken = (accessToken) => {
    try {
        return jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    } catch(error) {
        return null;
    }
}

export const verifyRefreshToken = (refreshToken) => {
    try {
        return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch(error) {
        return null;
    }
}