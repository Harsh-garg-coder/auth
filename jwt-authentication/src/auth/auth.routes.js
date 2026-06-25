import express from "express";
import { loginController, logoutController, profileController, singupController } from "./auth.controllers.js";
import { requireAuth } from "./auth.middlewares.js";

const router = express.Router();

router.post("/signup", singupController);

router.post("/login", loginController);

router.post("/logout", requireAuth, logoutController);

router.get("/profile", requireAuth, profileController);

export default router;