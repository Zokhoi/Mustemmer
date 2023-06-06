import { Response } from "express";
import { randomBytes } from "crypto";
import { connection } from "../data-source";
import { User } from "../entity";
import { APIResponse, APIRequest } from "../util";

export default async function generateToken(
  params: any,
  req: APIRequest,
  res: Response
) {
  let body: APIResponse = {
    status: "ok",
  };

  let token = randomBytes(32).toString("base64");
  req.user.token = token;
  await connection.manager.save(User, req.user);
  body.data = {
    token,
  }

  res.send(body);
}

generateToken.perms = ["L"];

export { generateToken };