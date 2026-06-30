import { getUserPermissions } from "../auth/auth.repository.js";
import { createPost, deletePost, getAllPosts, getPostById, updatePost } from "./post.repository.js";

export const createPostController = async (req, res) => {
    const { title, content } = req.body;
    if(!title || !content) {
        return res.status(400).json({error: "title and content are required!"});
    }

    const userId = req.user_id;
    
    const post = await createPost(title, content, userId);
    return res.status(201).json({ 
        id: post.id, 
        title: post.title, 
        content: post.content, 
        user_id: post.user_id,
        status: post.status
    });
}

export const getPostsController = async (req, res) => {
    const userId = req.user_id;

    const posts = await getAllPosts(userId);
    return res.status(200).json({posts});
}

export const getPostController = async (req, res) => {
    return res.status(200).json(req.resource);
}

export const updatePostController = async (req, res) => {
    const {id: postId} = req.params;
    const { title, content, status } = req.body || {};
    if(!title && !content && !status) {
        return res.status(400).json({error: "nothing to update"});
    }

    const updatedPost = await updatePost(title, content, status, postId);
    return res.status(200).json(updatedPost);
}

export const deletePostController = async (req, res) => {
    const {id: postId} = req.params;
    const deletedPost = await deletePost(postId);
    return res.status(200).json(deletedPost);
}