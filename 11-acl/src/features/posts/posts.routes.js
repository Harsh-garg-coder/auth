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

router.post(
    "/", 
    requireAuth, 
    createPostController
);
router.get(
    "/:id", 
    requireAuth, 
    requireAcl("read"), 
    getPostController
);
router.patch(
    "/:id", 
    requireAuth, 
    requireAcl("update"), 
    updatePostController
);
router.delete(
    "/:id", 
    requireAuth, 
    requireAcl("delete"), 
    deletePostController
);
router.post(
    "/:id/share", 
    requireAuth, 
    shareController
);

export default router;
