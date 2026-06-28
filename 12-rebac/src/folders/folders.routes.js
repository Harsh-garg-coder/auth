import express from "express";
import { requireAuth } from "../auth/auth.middlewares.js";
import {
    createFolderController,
    shareFolderController,
} from "./folders.controllers.js";

const router = express.Router();

// create: koi bhi logged-in user (owner tuple auto-write)
router.post("/", requireAuth, createFolderController);

// share: owner kisi user ko folder pe relation grant kare (inherited by posts inside)
router.post("/:id/share", requireAuth, shareFolderController);

export default router;
