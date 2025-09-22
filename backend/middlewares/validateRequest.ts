import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateRequest = (schemas: { body?: ZodObject }) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      return next();
    } catch (error) {
      return res.status(400).json(error);
    }
  };
};
