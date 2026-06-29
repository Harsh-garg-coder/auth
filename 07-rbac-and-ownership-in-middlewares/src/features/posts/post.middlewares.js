import { getPostById } from "./post.repository.js";

export const checkPostOwnership = (bypassPermissions, mode = "all") => {
    return async (req, res, next) => {
        const { id: postId } = req.params;
        
        const post = await getPostById(postId);

        if(!post) {
            return res.status(404).json({error: "Post not found!"});
        }

        req.post = post;

        const bypass = mode === "all" ? 
            bypassPermissions?.every(permission => req.user_permissions.includes(permission)) : 
            bypassPermissions?.some(permission => req.user_permissions.includes(permission));

        if(bypass) {
            return next();
        }

        if(post.user_id !== req.user_id) {
            return res.status(403).json({error: "forbidden"});
        }

        next();
    }
}