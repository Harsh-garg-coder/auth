import bcrypt from "bcrypt";
import { createUser, findUserByEmail, findUserById, setMfaEnabled, setMfaSecret } from "./auth.repository.js";
import { createAccessToken, createMfaToken, verifyMfaToken } from "../helpers/tokens.helpers.js";
import { decrypt, encrypt } from "../helpers/crypto.helpers.js";
import { authenticator } from "otplib";
import qrcode from "qrcode";

const isDev = process.env.NODE_ENVIRONMENT === "dev";

const cookieOptions = {
    httpOnly: true,
    secure: !isDev,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24, // 1 day
};

export const signupController = async (req, res) => {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (user) {
        return res.status(409).json({ error: "User already present!" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await createUser(email, hashedPassword);

    return res.status(201).json({
        id: newUser.id,
        email: newUser.email,
    });
};

export const loginController = async (req, res) => {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
        return res.status(401).json({ error: "Invalid email or credentials!" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or credentials!" });
    }

    if (user.is_mfa_enabled) {
        const mfaToken = createMfaToken(user.id);
        res.cookie("mfa_token", mfaToken, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 5, // 5 min
        });
        return res.status(200).json({ mfaRequired: true });
    }

    // MFA off — normal login
    const accessToken = createAccessToken(user.id);
    res.cookie("access_token", accessToken, cookieOptions);

    return res.status(200).json({ message: "logged in successfully!" });
};

export const profileController = async (req, res) => {
    const user = await findUserById(req.user_id);
    if (!user) {
        return res.status(404).json({ error: "user not found!" });
    }

    return res.status(200).json({ id: user.id, email: user.email });
};

export const mfaSetupController = async (req, res) => {
    const user = await findUserById(req.user_id);

    if(!user) {
        return res.status(404).json({ error: "user not found!"});
    }

    if(user.is_mfa_enabled) {
        return res.status(400).json({error: "MFA already enabled!"});
    }

    // creates a secret like JBSWY3DPEHPK3PXP
    const secret = authenticator.generateSecret();

    // creates an ui like otpauth://totp/MFA%20Demo:user@email.com?secret=JBSWY3DPEHPK3PXP&issuer=MFA%20Demo
    const otpauthUrl = authenticator.keyuri(user.email, "MFA Demo", secret);

    // encrypt the secret and store in DB.
    const encryptedSecret = encrypt(secret);
    await setMfaSecret(encryptedSecret, user.id);

    const qr = await qrcode.toDataURL(otpauthUrl);

    return res.status(200).json({ qr, secret, otpauthUrl });
};

export const mfaVerifyController = async (req, res) => {
    const { totp } = req.body;

    const user = await findUserById(req.user_id);

    if(!user) {
        return res.status(404).json({ error: "user not found!"});
    }

    if(user.is_mfa_enabled) {
        return res.status(400).json({error: "MFA already enabled!"});
    }

    if(!user.mfa_secret) {
        return res.status(400).json({error: "MFA setup not started!"});
    }

    const decreptedMfaSecret = decrypt(user.mfa_secret);
    const isValidTotp = authenticator.verify({token: totp, secret: decreptedMfaSecret});

    if(!isValidTotp) {
        return res.status(400).json({ error: "Invalid TOTP!"});
    }

    await setMfaEnabled(user.id, true);

    return res.status(200).json({message: "MFA enabled successfully!"});
}

export const mfaLoginController = async (req, res) => {
    const { totp } = req.body;
    const { mfa_token } = req.cookies;

    const payload = verifyMfaToken(mfa_token);
    if (!payload) {
        return res.status(401).json({ error: "MFA session invalid or expired!" });
    }

    const user = await findUserById(payload.id);
    if (!user || !user.is_mfa_enabled || !user.mfa_secret) {
        return res.status(400).json({ error: "MFA not set up for this user!" });
    }

    const decryptedSecret = decrypt(user.mfa_secret);
    const isValidTotp = authenticator.verify({ token: totp, secret: decryptedSecret });
    if (!isValidTotp) {
        return res.status(400).json({ error: "Invalid TOTP!" });
    }

    const accessToken = createAccessToken(user.id);
    res.cookie("access_token", accessToken, cookieOptions);
    res.clearCookie("mfa_token");

    return res.status(200).json({ message: "logged in successfully!" });
};