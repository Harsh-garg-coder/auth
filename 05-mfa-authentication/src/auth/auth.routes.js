import express from "express";
import {
    loginController,
    mfaLoginController,
    mfaSetupController,
    mfaVerifyController,
    profileController,
    signupController,
} from "./auth.controllers.js";
import { requireAuth } from "./auth.middlewares.js";

const router = express.Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/login/mfa", mfaLoginController); // login step 2 (no requireAuth — login ka hi hissa)
router.get("/profile", requireAuth, profileController);
router.post("/mfa/setup", requireAuth, mfaSetupController);
router.post("/mfa/verify", requireAuth, mfaVerifyController);

export default router;
