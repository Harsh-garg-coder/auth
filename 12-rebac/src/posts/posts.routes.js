import express from "express";
import { requireAuth } from "../auth/auth.middlewares.js";
import { requireRelation } from "../rebac/rebac.middlewares.js";
import {
    createPostController,
    deletePostController,
    getPostController,
    shareController,
    updatePostController,
} from "./posts.controllers.js";

const router = express.Router();

// create: koi bhi logged-in user (owner tuple auto-write hota hai)
router.post("/", requireAuth, createPostController);

// read/update/delete: ReBAC check() pass karna padega (direct/implied/inherited)
router.get("/:id", requireAuth, requireRelation("read"), getPostController);
router.patch("/:id", requireAuth, requireRelation("update"), updatePostController);
router.delete("/:id", requireAuth, requireRelation("delete"), deletePostController);

// share: owner kisi aur user ko relation grant kare
router.post("/:id/share", requireAuth, shareController);

export default router;
