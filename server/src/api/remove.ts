import { Request, Response } from "express";
import { In } from "typeorm";
import { connection } from "../data-source";
import { Song, Personnel } from "../entity";
import { APIResponse, APIError, normalizeSongId } from "../util";

export default async function remove(params: any, req: Request, res: Response) {
  let body: APIResponse = {
    status: "ok",
  };
  try {
    if (params.data) {
      let data =
        typeof params.data === "string" ? JSON.parse(params.data) : params.data;
      if (!(data instanceof Array)) {
        throw new APIError(
          "E_WRONG_PARAM_VAL_TYPE",
          'Param "data" has to be an Array.'
        );
      }
      let normalized = normalizeSongId(data);
      for (let i = 0; i < normalized.length; i++) {
        let song = normalized[i];
        let orig = await connection.manager.findOne(Song, {
          relations: ["personnel"],
          where: { id: song },
        });
        if (orig) {
          if (orig.personnel) {
            await connection.manager.delete(Personnel, {
              id: In(orig.personnel.map((v) => v.id)),
            });
          }
        } else
          throw new APIError(
            "E_NOT_EXIST",
            `Specified song id ${song} does not exist.`
          );
      }
      await connection.manager.delete(Song, { id: In(normalized) });
    }
  } catch (error) {
    body.status = "not_ok";
    body.error = error.status;
    body.message = error.message;
  } finally {
    res.send(body);
  }
}

remove.perms = ["L", "R", "W"];

export { remove };
