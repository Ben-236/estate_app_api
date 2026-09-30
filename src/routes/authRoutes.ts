import { Router } from "express";
import { registerEmail, verifyEmail, registerProfile, login } from "../controllers/authController";
import authMiddleware from "../middlewares/authMiddleware";

const authRouter = Router();

authRouter.post("/register",  registerEmail);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/register/profile", authMiddleware, registerProfile);
authRouter.post("/login", login);

export default authRouter;