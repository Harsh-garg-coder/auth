export const UserPolicies = {
    update: (user, targetUser) => {
        if(user.permissions.includes("user:update:any")) return true;
        return false;
    }
}