import { NextFunction, Request, Response } from "express";
import { connection } from "../data-source";
import { User, Session } from "../entity";
import { APIResponse, APIError, HandlerFunction } from "../util";

export default async function checkPermsAndExecute(
  handler: HandlerFunction,
  params: any,
  req: Request,
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
        let session = await connection.manager.findOneBy(Session, {
          id: sessionId,
        });
        if (!session || session.userAgent !== req.headers["user-agent"])
          throw new APIError("E_NO_PERMS", "Permission denied.");
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
