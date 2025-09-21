import { NextFunction, Request, Response } from "express";

export const responseHandler = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (body: any) {
    return originalJson.call(this, body);
  };

  next();
};
