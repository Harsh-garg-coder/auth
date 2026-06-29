import express from "express";
import { createPostController, deletePostController, getPostController, getPostsController, updatePostController } from "./post.controllers.js";
import { requireAuth } from "../auth/auth.middlewares.js";

const router = express.Router();

router.post("/", requireAuth, createPostController);
router.get("/", requireAuth, getPostsController);
router.get("/:id", requireAuth, getPostController);
router.patch("/:id", requireAuth, updatePostController);
router.delete("/:id", requireAuth, deletePostController);

export default router;