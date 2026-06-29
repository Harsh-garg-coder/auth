import { getUserPermissions } from "../auth/auth.repository.js";
import { createPost, deletePost, getAllPosts, getPostById, updatePost } from "./post.repository.js";

export const createPostController = async (req, res) => {
    const { title, content } = req.body;
    if(!title || !content) {
        return res.status(400).json({error: "title and content are required!"});
    }

    const userId = req.user_id;
    
    const post = await createPost(title, content, userId);
    return res.status(201).json({ id: post.id, title: post.title, content: post.content, user_id: post.user_id});
}

export const getPostsController = async (req, res) => {
    const posts = await getAllPosts();
    return res.status(200).json({posts});
}

export const getPostController = async (req, res) => {
    const {id: postId} = req.params;

    const post = await getPostById(postId);

    if(!post) {
        return res.status(404).json({error: "Post not found!"});
    } else {
        return res.status(200).json(post);
    }
}

export const updatePostController = async (req, res) => {
    const { title, content } = req.body || {};
    if(!title && !content) {
        return res.status(400).json({error: "nothing to update"});
    }

    const updatedPost = await updatePost(title, content, postId);
    return res.status(200).json(updatedPost);
}

export const deletePostController = async (req, res) => {
    const deletedPost = await deletePost(postId);
    return res.status(200).json(deletedPost);
}