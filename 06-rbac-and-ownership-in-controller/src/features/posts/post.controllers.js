import { getUserPermissions } from "../auth/auth.repository.js";
import { createPost, deletePost, getAllPosts, getPostById, updatePost } from "./post.repository.js";

export const createPostController = async (req, res) => {
    const { title, content } = req.body;
    if(!title || !content) {
        return res.status(400).json({error: "title and content are required!"});
    }

    const userId = req.user_id;

    // get user permissions
    const userPermissions = await getUserPermissions(userId);

    // check if user has post:create permission
    if(userPermissions.includes("post:create")) {
        const post = await createPost(title, content, userId);
        return res.status(201).json({ id: post.id, title: post.title, content: post.content, user_id: post.user_id});
    } else {
        return res.status(403).json({error: "Forbidden"});
    }
}

export const getPostsController = async (req, res) => {
    const userId = req.user_id;

    const userPermissions = await getUserPermissions(userId);

    // check if the user has post:read:any permission or not
    if(userPermissions.includes("post:read:any")) {
        const posts = await getAllPosts();
        return res.status(200).json({posts});
    } else {
        return res.status(403).json({error: "forbidden"});
    }
}

export const getPostController = async (req, res) => {
    const userId = req.user_id;
    const {id: postId} = req.params;

    const userPermissions = await getUserPermissions(userId);

    if(userPermissions.includes("post:read:any")) {
        const post = await getPostById(postId);

        if(!post) {
            return res.status(404).json({error: "Post not found!"});
        } else {
            return res.status(200).json(post);
        }
    } else {
        return res.status(403).json({ error: "forbidden"});
    }
}

export const updatePostController = async (req, res) => {
    const { id: postId } = req.params;

    const post = await getPostById(postId);

    if(!post) {
        return res.status(404).json({error: "Post not found!"});
    }

    const { title, content } = req.body || {};
    if(!title && !content) {
        return res.status(400).json({error: "nothing to update"});
    }

    const userId = req.user_id;
    const userPermissions = await getUserPermissions(userId);
    const hasPermissionToUpdateAllPosts = userPermissions.includes("post:update:any");
    const hasPermissionToUpdateHisOwnPosts = userPermissions.includes("post:update:own");
    
    if(!hasPermissionToUpdateAllPosts && !hasPermissionToUpdateHisOwnPosts) {
        return res.status(403).json({error: "forbidden"});
    }
    
    if(!hasPermissionToUpdateAllPosts && hasPermissionToUpdateHisOwnPosts) {
        if(post.user_id !== userId) {
            return res.status(403).json({error: "forbidden"});
        }
    }

    const updatedPost = await updatePost(title, content, postId);
    return res.status(200).json(updatedPost)
}

export const deletePostController = async (req, res) => {
    const { id: postId } = req.params;
    const userId = req.user_id;

    const post = await getPostById(postId);

    if(!post) {
        return res.status(404).json({error: "Post not found!"});
    }

    const userPermissions = await getUserPermissions(userId);
    const hasPermissionToDeleteAllPosts = userPermissions.includes("post:delete:any");
    const hasPermissionToDeleteHisOwnPost = userPermissions.includes("post:delete:own");

    if(!hasPermissionToDeleteAllPosts && !hasPermissionToDeleteHisOwnPost) {
        return res.status(403).json({error: "forbidden"});
    }

    if(!hasPermissionToDeleteAllPosts && hasPermissionToDeleteHisOwnPost && userId !== post.user_id) {
        return res.status(403).json({error: "forbidden"});
    }

    const deletedPost = await deletePost(postId);
    return res.status(200).json(deletedPost);
}