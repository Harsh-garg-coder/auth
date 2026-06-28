import express from "express";
import { requireAuth } from "../auth/auth.middlewares.js";
import { requirePolicy } from "./abac.middlewares.js";
import { createPostController, deletePostController, updatePostController } from "./posts.controllers.js";

const router = express.Router();

// create: koi bhi logged-in user (apni post)
router.post("/", requireAuth, createPostController);

// update/delete: ABAC policy decide karegi (attributes pe)
router.patch("/:id", requireAuth, requirePolicy("post:update"), updatePostController);
router.delete("/:id", requireAuth, requirePolicy("post:delete"), deletePostController);

export default router;