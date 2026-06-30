import express from "express";
import { loginController, logoutController, profileController, refreshController, signupController } from "./auth.controllers.js";
import { requireAuth } from "./auth.middlewares.js";

const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/profile", requireAuth, profileController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);

export default router;