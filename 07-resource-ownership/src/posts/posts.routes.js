import express from "express";
import { requireAuth } from "../auth/auth.middlewares.js";
import { requireOwnership } from "./posts.middlewares.js";
import { createPostController, updatePostController } from "./posts.controllers.js";

const router = express.Router();

router.post("/", requireAuth, createPostController);
router.patch("/:id", requireAuth, requireOwnership, updatePostController);

export default router;