import { Request, Response } from "express";
import { connection } from "../data-source";
import { Song, Personnel } from "../entity";
import { APIResponse, APIError, normalizeMultipleSong } from "../util";

export default async function add(params: any, req: Request, res: Response) {
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
      let songs: Song[] = [];
      let normalized = normalizeMultipleSong(data);
      for (let i = 0; i < normalized.length; i++) {
        let song = Song.from(normalized[i]);
        song.personnel = [];
        if (!normalized[i].personnel)
          throw new APIError(
            "E_FIELD_REQUIRED",
            "Field personnel is required with at least one artist."
          );
        for (let j = 0; j < normalized[i].personnel.length; j++) {
          const v = normalized[i].personnel[j];
          song.personnel.push(Personnel.from({ song, ...v }));
        }
        songs.push(song);
      }
      await connection.manager.save(Song, songs);
    }
  } catch (error) {
    body.status = "not_ok";
    body.error = error.status;
    body.message = error.message;
  } finally {
    res.send(body);
  }
}

add.perms = ["L", "R", "W"];

export { add };
