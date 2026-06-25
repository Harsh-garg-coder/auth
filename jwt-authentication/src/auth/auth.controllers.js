import { createUser, findUserByEmail, getUserById } from "./auth.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const isDev = process.env.NODE_ENVIRONMENT === "dev";

export const singupController = async (req, res) => {
    const { email, password } = req.body; 

    // check if user already present
    const user = await findUserByEmail(email);

    if(user) {
        return res.status(409).json({ error: "User already present!" });
    } else {
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await createUser(email, hashedPassword);

        return res.status(201).json({
            id: newUser.id,
            email: newUser.email,
        });
    }
}

export const loginController = async (req, res) => {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if(!user) {
        return res.status(401).json({ error: "Invalid email or credentials"});
    } else {
        const isPasswordSame = await bcrypt.compare(password, user.password); 
        if(!isPasswordSame) {
            return res.status(401).json({ error: "Invalid email or credentials"});
        } else {
            // create jwt token and send in response
            const payload = {
                id: user.id,
                email: user.email
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "1day"
            });

            
            res.cookie("token", token, {
                httpOnly: true,
                secure: !isDev,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 24,
            });
            res.status(200).json({message: "logged in successfully"});
        }
    }
}

export const logoutController = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: !isDev,
        sameSite: "strict",
    });

    res.status(200).json({ message: "logged out successfully"});
}

export const profileController = async (req, res) => {
    const userId = req.userId;

    const user = await getUserById(userId);

    if(!user) {
        return res.status(404).json({error: "User not found!"});
    }

    res.status(200).json({ id: userId, email: user.email});
}