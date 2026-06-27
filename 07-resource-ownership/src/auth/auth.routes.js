import express from "express";
import { adminController, loginController, logoutController, profileController, refreshController, signupController } from "./auth.controllers.js";
import { requireAuth, requireRole } from "./auth.middlewares.js";

const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/profile", requireAuth, profileController);
router.post("/refresh", refreshController);
router.post("/logout", logoutController);

router.get("/admin", requireAuth, requireRole("admin"), adminController);

export default router;