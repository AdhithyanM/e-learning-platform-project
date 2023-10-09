import express from "express";
import { registerUser, activateUser } from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.post("/registerUser", registerUser);

userRouter.post("/activateUser", activateUser);

export default userRouter;
