import express from "express";
import { requireAuth } from "../auth/auth.middlewares.js";
import { requireAcl } from "./acl.middlewares.js";
import {
    createPostController,
    deletePostController,
    getPostController,
    shareController,
    updatePostController,
} from "./posts.controllers.js";

const router = express.Router();

// create: koi bhi logged-in user (apni post — owner ko auto full ACL milti hai)
router.post("/", requireAuth, createPostController);

// read/update/delete: ACL list me us permission ki entry honi chahiye
router.get("/:id", requireAuth, requireAcl("read"), getPostController);
router.patch("/:id", requireAuth, requireAcl("update"), updatePostController);
router.delete("/:id", requireAuth, requireAcl("delete"), deletePostController);

// share: owner kisi aur user ko permission grant kare
router.post("/:id/share", requireAuth, shareController);

export default router;
