import express from "express";
import { authorize, requireAuth } from "../auth/auth.middlewares.js";
import { UserPolicies } from "./users.policies.js";
import { findUserById } from "../auth/auth.repository.js";
import { updateUserController } from "./users.controllers.js";


const router = express.Router();

router.patch("/:id", requireAuth, authorize(UserPolicies.update, (req) => findUserById(req.params.id)), updateUserController);

export default router;