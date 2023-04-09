import { DataSource } from "typeorm";
import { entities } from "./entity";
import { config } from "./util";

const pgSource = new DataSource({
  type: "postgres",
  host: config?.postgres?.host ?? "localhost",
  port: config?.postgres?.port ?? 5432,
  username: config?.postgres?.username ?? "test",
  password: config?.postgres?.password ?? "test",
  database: config?.postgres?.database ?? "test",
  synchronize: config?.postgres?.synchronize ?? true,
  // dropSchema: true,
  logging: config?.postgres?.logging ?? false,
  entities: entities,
  migrations: [],
  subscribers: [],
});

const liteSource = new DataSource({
  type: "sqlite",
  database: "./test.db",
  entities: entities,
  logger: "debug",
  synchronize: true,
  dropSchema: true,
});

export const connection = pgSource;
