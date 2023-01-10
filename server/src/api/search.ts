import { Request, Response } from "express";
import { connection } from "../data-source";
import { Song } from "../entity";
import { APIResponse, APIError, normalizeSong } from "../util";

let queryCond = {
  id: {
    key: "id",
    type: "number",
    array: false,
    whole: "andWhere",
    cmpop: "=",
    join: "OR",
  },
  key: {
    key: "key",
    type: "string",
    array: true,
    whole: "andWhere",
    join: "OR",
  },
  time: {
    key: "time",
    type: "string",
    array: true,
    whole: "andWhere",
    join: "OR",
  },
  variableTempo: {
    key: "variableTempo",
    type: "boolean",
    array: false,
    whole: "andWhere",
    cmpop: "=",
    join: "OR",
  },
  variableTime: {
    key: "variableTime",
    type: "boolean",
    array: false,
    whole: "andWhere",
    cmpop: "=",
    join: "OR",
  },
};

export default async function search(params: any, req: Request, res: Response) {
  let body: APIResponse = {
    status: "ok",
  };
  let normalized = normalizeSong(params);
  let limit =
    typeof params.limit === "number" && !isNaN(params.limit)
      ? Math.abs(parseInt(params.limit))
      : 50;
  let page =
    typeof params.page === "number" && !isNaN(params.page)
      ? Math.abs(parseInt(params.page))
      : 1;
  let dbquery = connection.manager
    .createQueryBuilder(Song, "song")
    .select()
    .take(limit)
    .skip((page - 1) * limit);
  for (const key in queryCond) {
    if (normalized[key]) {
      if (!queryCond[key].array) {
        let dbqParams = {};
        dbqParams[key] = normalized[key];
        dbquery = dbquery.andWhere(
          `song.${key} ${queryCond[key].cmpop} :${key}`,
          dbqParams
        );
      } else if (
        queryCond[key].type === "string" &&
        Array.isArray(normalized[key]) &&
        normalized[key].length
      ) {
        let conditions = [];
        let dbqParams = {};
        for (let i = 0; i < normalized[key].length; i++) {
          conditions.push(`regexp_arr(:${key}${i}, song.${key})`);
          dbqParams[`${key}${i}`] = normalized[key][i];
        }
        dbquery = dbquery.andWhere(
          `(${conditions.join(` ${queryCond[key].join} `)})`,
          dbqParams
        );
      }
    }
  }
  if (normalized.name) {
    let conditions: string[] = [
      `song.name ILIKE :name`,
      `song.translatedName ILIKE :name`,
    ];
    let dbqParams: any = {
      name: normalized.name,
    };
    dbquery = dbquery.andWhere(`(${conditions.join(` OR `)})`, dbqParams);
  }
  if (normalized.tempo) {
    if (Array.isArray(normalized.tempo)) {
      let conditions: string[] = [];
      let dbqParams: any = {};
      for (let i = 0; i < normalized.tempo.length; i++) {
        if (Array.isArray(normalized.tempo[i])) {
          if (
            normalized.tempo[i][0] !== null &&
            normalized.tempo[i][1] !== null
          ) {
            conditions.push(
              `range_arr( floatrange( CAST(:tempomin${i} AS float), CAST(:tempomax${i} AS float), '[]' ), song.tempo )`
            );
            dbqParams[`tempomin${i}`] = normalized.tempo[i][0];
            dbqParams[`tempomax${i}`] = normalized.tempo[i][1];
          } else if (normalized.tempo[i][0] !== null) {
            conditions.push(
              `range_arr( floatrange( CAST(:tempomin${i} AS float), NULL, '[]' ), song.tempo )`
            );
            dbqParams[`tempomin${i}`] = normalized.tempo[i][0];
          } else if (normalized.tempo[i][1] !== null) {
            conditions.push(
              `range_arr( floatrange( NULL, CAST(:tempomax${i} AS float), '[]' ), song.tempo )`
            );
            dbqParams[`tempomax${i}`] = normalized.tempo[i][1];
          }
        } else if (typeof normalized.tempo[i] === "number") {
          conditions.push(`song.tempo = :tempo${i}`);
          dbqParams[`tempo${i}`] = normalized.tempo[i];
        }
      }
      dbquery = dbquery.andWhere(`(${conditions.join(` OR `)})`, dbqParams);
    } else if (["number", "string"].includes(typeof normalized.tempo)) {
      let val = parseFloat(normalized.tempo);
      if (!isNaN(val))
        dbquery = dbquery.andWhere(`song.tempo = :tempo`, { tempo: val });
    }
  }

  if (normalized.personnel) {
    if (Array.isArray(normalized.personnel)) {
      let conditions: string[] = [];
      let dbqParams: any = {};
      for (let i = 0; i < normalized.personnel.length; i++) {
        conditions.push(`personnel.name ILIKE :personnel${i}`);
        dbqParams[`personnel${i}`] = normalized.personnel[i].name;
      }
      dbquery = dbquery.innerJoinAndSelect(
        "song.personnel",
        "personnel",
        `(${conditions.join(` OR `)})`,
        dbqParams
      );
    } else {
      dbquery = dbquery.innerJoinAndSelect(
        "song.personnel",
        "personnel",
        `personnel.name ILIKE ${normalized.personnel}`
      );
    }
  } else {
    dbquery = dbquery.leftJoinAndSelect("song.personnel", "personnel");
  }

  // console.log(dbquery.getQueryAndParameters())

  let [songs, count] = await dbquery.getManyAndCount();
  body.data = { song: songs.map((s) => Song.serializeSync(s)), count };
  res.send(body);
}

search.perms = ["R"];

export { search };
