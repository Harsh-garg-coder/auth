import express from "express";
import { createPostController, deletePostController, getPostController, getPostsController, updatePostController } from "./post.controllers.js";
import { requireAuth, requirePermissions } from "../auth/auth.middlewares.js";
import { checkPostOwnership } from "./post.middlewares.js";

const router = express.Router();

router.post("/", requireAuth, requirePermissions(["post:create"]), createPostController);
router.get("/", requireAuth, requirePermissions(["post:read:any"]), getPostsController);
router.get("/:id", requireAuth, requirePermissions(["post:read:any"]), getPostController);
router.patch("/:id", requireAuth, requirePermissions(["post:update:any", "post:update:own"], "any"), checkPostOwnership(["post:update:any"]), updatePostController);
router.delete("/:id", requireAuth, requirePermissions(["post:delete:any", "post:delete:own"], "any"), checkPostOwnership(["post:delete:any"]), deletePostController);

export default router;