import { Request, Response } from "express";
import { connection } from "../data-source";
import { Session, User } from "../entity";
import { APIResponse, APIError } from "../util";

export default async function createUser(
  params: any,
  req: Request,
  res: Response
) {
  let body: APIResponse = {
    status: "ok",
  };

  if (!params.username || !params.password) {
    throw new APIError(
      "E_FIELD_REQUIRED",
      "Username and password are required."
    );
  }
  let q = await connection.query(
    `SELECT EXISTS( SELECT 1 FROM "user" "user" WHERE "user"."username" = $1 )`,
    [params.username]
  );
  if (q[0].exists)
    throw new APIError("E_USERNAME_TAKEN", "Username is already taken.");

  let user = User.from({
    username: params.username,
    password: params.password,
  });
  await connection.manager.insert(User, user);
  let session = new Session({ user, userAgent: req.headers["user-agent"] });
  await connection.manager.insert(Session, session);
  res.cookie("mustemmer_session_id", session.id);
  res.send(body);
}

createUser.perms = [];

export { createUser };
