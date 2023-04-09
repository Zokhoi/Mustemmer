import { NextFunction, Response } from "express";
import { connection } from "../data-source";
import { Session } from "../entity";
import { APIResponse, APIError, APIRequest, HandlerFunction } from "../util";

export default async function checkPermsAndExecute(
  handler: HandlerFunction,
  params: any,
  req: APIRequest,
  res: Response,
  next: NextFunction
) {
  let body: APIResponse = {
    status: "ok",
  };
  try {
    if (handler.perms.includes("L")) {
      // Endpoint requires user to be logged in.
      let sessionId = req.cookies?.mustemmer_session_id;
      if (sessionId) {
        let session = await connection.manager.findOne(Session, {
          relations: ["user"],
          where: { id: sessionId },
        });
        if (!session || session.userAgent !== req.headers["user-agent"])
          throw new APIError("E_NO_PERMS", "Permission denied.");

        /* Save logged in user for later use */
        req.user = session.user;
      } else throw new APIError("E_NO_PERMS", "Permission denied.");
    }

    return await handler(params, req, res, next);
  } catch (error) {
    body.status = "not_ok";
    body.error = error.status;
    body.message = error.message;
    res.send(body);
  }
}

export { checkPermsAndExecute };
