 import { createPost, deletePost, updatePost } from "./posts.repository.js";
  import { findUserById } from "../auth/auth.repository.js";

  export const createPostController = async (req, res) => {
      const { title, content, status } = req.body;
      if(!title || !content) {
        return res.status(400).json({ error: "title and content is required!"});
      }

      // post ka department = creator ka department (subject attr → resource pe copy)
      const user = await findUserById(req.user_id);
      const post = await createPost(title, content, req.user_id, user.department, status || "draft");
      res.status(201).json({
        id: post.id,
        title: post.title,
        content: post.content,
        department: post.department,
        status: post.status,
      });
  };

  export const updatePostController = async (req, res) => {
      const postId = req.post.id;
      const { title, content } = req.body;

      if(!title && !content) {
        return res.status(400).json({ error: "Nothing to update!"});
      }

      const updatedPost = await updatePost(postId, title, content);
      res.status(200).json({
        id: updatedPost.id,
        title: updatedPost.title,
        content: updatedPost.content,
      });
  };

  export const deletePostController = async (req, res) => {
      // requirePolicy ne post fetch + verify kar liya → req.post available
      const postId = req.post.id;

      await deletePost(postId);
      res.status(200).json({ message: "Post deleted successfully!" });
  };