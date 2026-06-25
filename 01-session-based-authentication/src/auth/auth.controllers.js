import bcrypt from "bcrypt";
import { createUser, findUserByEmail, findUserById } from "./auth.repository.js";

export const signupController = async (req, res) => {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if(user) {
        return res.status(409).json({
            error: "User already exists!"
        });
    } else {
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await createUser(email, hashedPassword);
        res.status(201).json({
            id: newUser.id,
            email: newUser.email
        });
    }
}

export const loginController = async (req, res) => {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);

    if(!user)  {
        return res.status(401).json({
            error: "Invalid email or credentials!",
        });
    } else {
        const isSamePassword = await bcrypt.compare(password, user.password);

        if(!isSamePassword) {
            return res.status(401).json({
                error: "Invalid email or credentials!",
            });
        } else {
            req.session.userId = user.id;
            return res.status(200).json({
                message: "user logged in successfully!",
            });
        }
    }
}

export const profileController = async (req, res) => {
    const userId = req.session.userId;

    const user = await findUserById(userId);

    if(user) {
        return res.status(200).json({
            id: user?.id,
            email: user.email,
        })
    } else {
        return res.status(404).json({
            error: "User not found!",
        })
    }
}

export const logoutController = async (req, res) => {
    req.session.destroy((err) => {
        if(err) {
           return res.status(500).json({error: err.message});
        } else {
            res.clearCookie("connect.sid");
            return res.json({message: "Logged out!"});
        }
    })
}