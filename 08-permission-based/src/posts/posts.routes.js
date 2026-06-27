import express from "express";
import { requireAuth, requirePermission } from "../auth/auth.middlewares.js";
import { requireOwnership } from "./posts.middlewares.js";
import { createPostController, deletePostController, updatePostController } from "./posts.controllers.js";

const router = express.Router();

router.post("/", requireAuth, requirePermission("post:create"), createPostController);
router.patch("/:id", requireAuth, requirePermission("post:update"), requireOwnership, updatePostController);
router.delete("/:id", requireAuth, requirePermission("post:delete"), requireOwnership, deletePostController);

export default router;