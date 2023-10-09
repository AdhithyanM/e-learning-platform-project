import { NextFunction, Request, Response } from "express";

const CatchAsyncError =
  (func: any) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(func(req, res, next)).catch(next);
  };

export default CatchAsyncError;
