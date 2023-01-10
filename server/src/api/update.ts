import { Request, Response } from "express";
import { In } from "typeorm";
import { connection } from "../data-source";
import { Song, Personnel } from "../entity";
import { APIResponse, APIError, normalizeMultipleSong } from "../util";

export default async function update(params: any, req: Request, res: Response) {
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
      let normalized = normalizeMultipleSong(data);
      for (let i = 0; i < normalized.length; i++) {
        let song = normalized[i];
        let orig = await connection.manager.findOne(Song, {
          relations: ["personnel"],
          where: { id: song.id },
        });
        if (orig) {
          if (song.personnel) {
            let names = song.personnel.map((v) => v.name);
            let remove: Personnel[] = [];
            let existing: Personnel[] = [];
            orig.personnel.forEach((v) =>
              (names.includes(v.name) ? existing : remove).push(v)
            );
            for (let j = 0; j < remove.length; j++) {
              await connection.manager.delete(Personnel, {
                id: In(remove.map((v) => v.id)),
              });
            }
            for (let j = 0; j < song.personnel.length; j++) {
              let src = existing.find((v) => v.name === song.personnel[j].name);
              if (src !== undefined) {
                src.role = song.personnel[j].role ?? src.role;
              } else {
                existing.push(
                  Personnel.from({
                    song: orig,
                    name: song.personnel[j].name,
                    role: song.personnel[j].role,
                  })
                );
              }
            }
            orig.personnel = existing;
          }
          [
            "name",
            "key",
            "tempo",
            "time",
            "variableTempo",
            "variableTime",
            "location",
          ].forEach((v) => {
            if (song[v] !== undefined) orig[v] = song[v];
          });
          if (song.release) orig.release = new Date(song.release);
          await connection.manager.save(orig);
        } else
          throw new APIError(
            "E_NOT_EXIST",
            "Specified song id does not exist."
          );
      }
    }
  } catch (error) {
    body.status = "not_ok";
    body.error = error.status;
    body.message = error.message;
  } finally {
    res.send(body);
  }
}

update.perms = ["L", "R", "W"];

export { update };
