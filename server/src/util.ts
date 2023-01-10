import { resolve } from "path";
import { readFileSync } from "fs";
import * as yaml from "js-yaml";
import { Request, Response, NextFunction } from "express";

export const config: any = yaml.load(
  readFileSync(resolve(__dirname, "../config.yaml"), "utf8")
);

export interface APIResponse {
  status: string;
  data?: any;
  message?: string;
  error?: string;
}

export interface APIError extends Error {
  status: string;
}

export class APIError extends Error implements APIError {
  constructor(status: string, msg: string) {
    super(msg);
    this.status = status;
  }
}

export interface HandlerFunction {
  (params: any, req: Request, res: Response, next: NextFunction): any;
  perms: string[];
}

export function normalizeSong(data: any) {
  let song: any = {};
  if (data.id && !isNaN(parseInt(data.id))) song.id = data.id;
  if (data.name) song.name = data.name;
  if (data.translatedName) song.translatedName = data.translatedName;
  if (data.location) song.location = data.location;
  if (data.release && !isNaN(Date.parse(data.release)))
    song.release = data.release;
  if (data.variableTempo !== undefined)
    song.variableTempo = !!data.variableTempo;
  if (data.variableTime !== undefined) song.variableTime = !!data.variableTime;
  if (data.personnel) {
    let personnel = [];
    if (Array.isArray(data.personnel)) {
      for (let j = 0; j < data.personnel.length; j++) {
        let p = data.personnel[j];
        let person: any = {};
        if (typeof p === "string") {
          person.name = p;
        } else if (p.hasOwnProperty("name")) {
          person.name = p.name;
          if (p.hasOwnProperty("role")) {
            if (typeof p.role === "string") {
              person.role = [p.role];
            } else if (Array.isArray(p.role)) {
              person.role = p.role;
            }
          }
        } else continue;
        personnel.push(person);
      }
    } else if (typeof data.personnel === "string") {
      personnel.push({ name: data.personnel });
    }
    if (personnel.length) song.personnel = personnel;
  }

  if (data.key) {
    let key: string[] = [];
    if (Array.isArray(data.key)) {
      for (let j = 0; j < data.key.length; j++) {
        if (typeof data.key[j] === "string") {
          key.push(data.key[j]);
        } else continue;
      }
    } else if (typeof data.key === "string") {
      key.push(data.key);
    }
    if (key.length) song.key = [...new Set(key)];
  }

  if (data.tempo) {
    let tempo: Array<string | number> = [];
    if (Array.isArray(data.tempo)) {
      for (let j = 0; j < data.tempo.length; j++) {
        if (Array.isArray(data.tempo[j])) {
          let pair = [
            parseFloat(data.tempo[j][0]),
            parseFloat(data.tempo[j][1]),
          ].map((v) => (isNaN(v) ? null : v));
          if (pair[0] !== null || pair[1] !== null)
            tempo.push(JSON.stringify(pair));
        } else {
          switch (typeof data.tempo[j]) {
            case "string":
              let t = parseFloat(data.tempo[j]);
              if (!isNaN(t)) tempo.push(t);
              break;
            case "number":
              tempo.push(data.tempo[j]);
              break;
            default:
              break;
          }
        }
      }
    } else {
      switch (typeof data.tempo) {
        case "string":
          let t = parseInt(data.tempo);
          if (!isNaN(t)) tempo.push(t);
          break;
        case "number":
          tempo.push(data.tempo);
          break;
        default:
          break;
      }
    }
    if (tempo.length)
      song.tempo = [...new Set(tempo)].map((v) =>
        typeof v === "string" ? JSON.parse(v) : v
      );
  }

  if (data.time) {
    let time: string[] = [];
    if (Array.isArray(data.time)) {
      for (let j = 0; j < data.time.length; j++) {
        if (typeof data.time[j] === "string") {
          time.push(data.time[j]);
        } else continue;
      }
    } else if (typeof data.time === "string") {
      time.push(data.time);
    }
    if (time.length) song.time = [...new Set(time)];
  }
  return song;
}

export function normalizeMultipleSong(data: any[]) {
  return data.map((v) => normalizeSong(v));
}

export function normalizeSongId(data: any[]) {
  let normalized = [];
  for (let i = 0; i < data.length; i++) {
    if (typeof data[i] === "number") {
      normalized.push(data[i]);
    } else if (typeof data[i] === "string" && !isNaN(parseInt(data[i]))) {
      normalized.push(data[i]);
    } else if (data[i]?.id) {
      normalized.push(data[i].id);
    }
  }
  return normalized;
}
