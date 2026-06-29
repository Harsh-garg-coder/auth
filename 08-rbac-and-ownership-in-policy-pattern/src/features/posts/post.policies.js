export const PostPolicies = {
    create: (user, post) => user.permissions.includes("post:create"),
    read: (user, post) => user.permissions.includes("post:read:any"),
    update: (user, post) => {
        if(user.permissions.includes("post:update:any")) return true;
        if(user.permissions.includes("post:update:own") && user.id === post.user_id) return true;
    },
    delete: (user, post) => {
        if(user.permissions.includes("post:delete:any")) return true;
        if(user.permissions.includes("post:delete:own") && user.id === post.user_id) return true;
    }
}