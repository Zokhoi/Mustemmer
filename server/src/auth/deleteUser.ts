import { Response } from "express";
import { connection } from "../data-source";
import { User } from "../entity";
import { APIResponse, APIError, APIRequest } from "../util";

export default async function deleteUser(
  params: any,
  req: APIRequest,
  res: Response
) {
  let body: APIResponse = {
    status: "ok",
  };

  let userId = req.user.id;

  if (params.userId) {
    if (userId !== params.userId) {
      throw new APIError(
        "E_NO_PERMS",
        "You do not have the permission to delete other users."
      );
    }
  }
  let user = await connection.manager.findOneBy(User, {
    id: userId,
  });
  if (!user) {
    throw new APIError(
      "E_USER_INVALID",
      "User is invalid. Maybe already deleted?"
    );
  } else {
    await connection.manager.delete(User, {
      id: userId
    });
  }
  res.send(body);
}

deleteUser.perms = ["L"];

export { deleteUser };