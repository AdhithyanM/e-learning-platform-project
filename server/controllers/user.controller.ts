require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import CatchAsyncError from "../middleware/catchAsyncErrors";
import jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";

interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar: string;
}

export const registerUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, avatar } = req.body;

      const isEmailExists = await userModel.findOne({ email });
      if (isEmailExists) {
        return next(new ErrorHandler("Email already exists", 400));
      }

      const user: IRegistrationBody = {
        name,
        email,
        password,
        avatar,
      };

      const { activationCode, activationToken } = createActivationToken(user);

      const data = { user: { name: user.name }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );

      try {
        await sendMail({
          email: user.email,
          subject: "Activate your account",
          template: "activation-mail.ejs",
          data,
        });

        res.status(201).json({
          success: true,
          message: `Please check your mail: ${user.email} to activate your account`,
          activationToken,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IActivationInfo {
  activationToken: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActivationInfo => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const activationToken = jwt.sign(
    { user, activationCode },
    process.env.USER_ACTIVATION_SECRET as Secret,
    { expiresIn: "5m" }
  );

  return { activationToken, activationCode };
};

interface IActivationRequest {
  activationToken: string;
  activationCode: string;
}
interface IUserInfo {
  user: IUser;
  activationCode: string;
}

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activationToken, activationCode } =
        req.body as IActivationRequest;

      const userInfo: IUserInfo = jwt.verify(
        activationToken,
        process.env.USER_ACTIVATION_SECRET as Secret
      ) as IUserInfo;

      if (userInfo.activationCode !== activationCode) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }

      const { name, email, password } = userInfo.user;

      const existingUser = await userModel.findOne({ email });

      if (existingUser) {
        return next(new ErrorHandler("Email already exists", 400));
      }

      const user = await userModel.create({
        name,
        email,
        password,
      });

      res.status(201).json({
        success: true,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
