import express from "express";
import { createPostController, deletePostController, getPostController, getPostsController, updatePostController } from "./post.controllers.js";
import { authorize, requireAuth } from "../auth/auth.middlewares.js";
import { PostPolicies } from "./post.policies.js";
import { getPostById, getUserPostsCountById } from "./post.repository.js";

const router = express.Router();

router.post(
    "/", 
    requireAuth, 
    authorize(PostPolicies.create, null, async (req) => {
        const userPostCount = await getUserPostsCountById(req.user_id);
        const context = {
            userPostCount
        };
        return context;
    }), 
    createPostController
);
router.get(
    "/", 
    requireAuth, 
    authorize(PostPolicies.readAll), 
    getPostsController
);
router.get(
    "/:id", 
    requireAuth, 
    authorize(PostPolicies.read, (req) => getPostById(req.params.id)), 
    getPostController
);
router.patch(
    "/:id", 
    requireAuth,
    authorize(PostPolicies.update, (req) => getPostById(req.params.id)), 
    updatePostController
);
router.delete(
    "/:id", 
    requireAuth, 
    authorize(PostPolicies.delete, (req) => getPostById(req.params.id)), 
    deletePostController
);

export default router;