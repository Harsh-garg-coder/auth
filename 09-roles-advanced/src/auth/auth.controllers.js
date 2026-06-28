import bcrypt from "bcrypt";
import { assignRole, createUser, findRefreshToken, findUserByEmail, findUserById, getUserRoles, revokeAllRefreshToken, revokeRefreshToken, saveRefreshToken } from "./auth.repository.js";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../helpers/tokens.helpers.js";
import crypto from "crypto";

const isDev = process.env.NODE_ENVIRONMENT === "dev";

export const signupController = async (req, res) => {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if(user) {
        return res.status(409).json({ error: "User already present!"});
    } else {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await createUser(email, hashedPassword);
        await assignRole(user.id, "user");  
        return res.status(201).json({
            id: user.id,
            email: user.email,
        });
    }
}

export const loginController = async (req, res) => {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if(!user) {
        return res.status(401).json({ error: "Invalid email or credentials!"});
    } else {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if(!isValidPassword) {
            return res.status(401).json({ error: "Invalid email or credentials!"});
        } else {
            // create access token
            const accessToken = createAccessToken(user.id);

            // create refresh token
            const refreshToken = createRefreshToken(user.id);

            // hash refresh token
            const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

            // store refresh token
            const isSaved = await saveRefreshToken(hashedRefreshToken, user.id);

            res.cookie("access_token", accessToken, {
                httpOnly: true,
                secure: !isDev,
                sameSite: "lax",
                maxAge: 1000 * 60 * 15,
            });
            res.cookie("refresh_token", refreshToken, {
                httpOnly: true,
                secure: !isDev,
                sameSite: "lax",
                maxAge: 1000 * 60 * 60 * 24 * 7,
            });

            res.status(200).json({
                message: "logged in successfully!",
            });
        }
    }
}

export const profileController = async (req, res) => {
    const userId = req.user_id;

    const user = await findUserById(userId);

    if(!user) {
        return res.status(404).json({
            error: "user not found!",
        });
    } else {
        const roles = await getUserRoles(userId);
        res.status(200).json({ id: userId, email: user.email, roles });
    }
}

export const refreshController = async (req, res) => {
    const { refresh_token } = req.cookies;

    // check if refresh token is present
    if(!refresh_token) {
        return res.status(401).json({error: "Unauthenticated"});
    }

    // check if refresh token is valid or not
    const isVerifiedRefreshToken = verifyRefreshToken(refresh_token);
    if(!isVerifiedRefreshToken) {
        return res.status(401).json({error: "Unauthenticated"});
    }

    // check if refresh token is revoked or not
    const hashedRefreshToken = crypto.createHash("sha256").update(refresh_token).digest("hex");
    const refreshTokenRow = await findRefreshToken(hashedRefreshToken);
    if(!refreshTokenRow || refreshTokenRow?.is_revoked) {
        if(refreshTokenRow?.is_revoked) {
            // revoke all refresh token
            await revokeAllRefreshToken(refreshTokenRow?.user_id);
        }
        return res.status(401).json({error: "Unauthenticated"});
    }

    // here refresh token is valid and not revoked
    const accessToken = createAccessToken(refreshTokenRow?.user_id);

    await revokeRefreshToken(hashedRefreshToken);
    const newRefreshToken = createRefreshToken(refreshTokenRow?.user_id);
    const newHashedRefreshToken = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    await saveRefreshToken(newHashedRefreshToken, refreshTokenRow?.user_id);

    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: !isDev,
        sameSite: "lax",
        maxAge: 1000 * 60 * 15,
    });
    res.cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: !isDev,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.status(200).json({message: "refreshed"});
}

export const logoutController = async (req, res) => {
    const { refresh_token } = req.cookies;

    if(!refresh_token) {
        return res.status(401).json({error: "unauthenticated"});
    }
    
    // revoke refresh token
    const hashedRefreshToken = crypto.createHash("sha256").update(refresh_token).digest("hex");
    const isRevoked = await revokeRefreshToken(hashedRefreshToken);
    if(!isRevoked) {
        return res.status(400).json({error: "Failed to logout"});
    }

    // remove access_token and refresh_token
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.status(200).json({message: "Logged out successfully!"});
}

export const adminController = (req, res) => {
    res.status(200).json({
        message: "Welcome admin!",
        role: req.role,   
    });
};