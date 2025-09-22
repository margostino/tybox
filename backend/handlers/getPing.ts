import { Request, Response } from "express";

export const getPing = async (req: Request, res: Response) => {
  res.status(200).send("pong");
};
