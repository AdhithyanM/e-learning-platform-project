import express from "express";
import {
  registerUser,
  activateUser,
  loginUser,
  logoutUser,
  updateAccessToken,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/registerUser", registerUser);

userRouter.post("/activateUser", activateUser);

userRouter.post("/login", loginUser);

userRouter.get("/logout", isAuthenticated, logoutUser);

userRouter.get("/refreshToken", updateAccessToken);

export default userRouter;
