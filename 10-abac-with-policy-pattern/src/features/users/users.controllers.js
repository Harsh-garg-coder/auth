import { getUserRoles } from "../auth/auth.repository.js";
import { updateUser } from "./users.repository.js";

export const updateUserController = async (req, res) => {
    const { isPremium } = req.body || {};
    const { id: targetUserId } = req.params;

    if(!isPremium) {
        return res.status(400).json({ error: "Nothing to update"});
    }

    const updatedUser = await updateUser(isPremium, targetUserId);
    const userRoles = await getUserRoles(targetUserId);

    res.status(200).json({
        id: updatedUser.id,
        email: updatedUser.email, 
        roles: userRoles,
        is_premium: updatedUser.is_premium
    });
}