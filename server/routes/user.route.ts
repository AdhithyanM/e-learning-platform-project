import express from "express";
import {
  registerUser,
  activateUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.post("/registerUser", registerUser);

userRouter.post("/activateUser", activateUser);

userRouter.post("/login", loginUser);

userRouter.post("/logout", logoutUser);

export default userRouter;
