import dotenv from "dotenv";
import { PoolConfig } from "pg";
import getFromEnvOrFile from "../../lib/GetFromEnvOrFile";

dotenv.config();

// TODO: See if we need to tweak this timeout value.
const shortTimeout = 2 * 1000;
const longTimeout = 30 * 1000;

const inDocker = process.env.RUNNING_IN_DOCKER;

const dbName: () => string = () => {
  if (typeof process.env.PGDATABASE === "string") {
    return process.env.PGDATABASE;
  }

  if (typeof inDocker === "string") {
    if (typeof process.env.POSTGRES_DB === "string") {
      return process.env.POSTGRES_DB;
    }

    if (typeof process.env.POSTGRES_USER === "string") {
      return process.env.POSTGRES_USER;
    }
  }

  throw Error("Could not find PGDATABASE|POSTGRES_DB|POSTGRES_USER");
};

// TODO: Fix this so it uses Postgres environment variables like PGHOST if they
//       are present. https://www.postgresql.org/docs/9.1/libpq-envars.html
export const pgPoolConfig: () => PoolConfig = () => {
  const pgDb = dbName();
  let pgPass: string | undefined;

  try {
    pgPass = getFromEnvOrFile("POSTGRES_PASSWORD");
  } catch (err) {
    pgPass = undefined;
  }

  return {
    application_name: "linkfix",

    host: inDocker ? "postgres.docker" : <string>process.env.PGHOST,
    port: inDocker ? 5432 : Number(<string>process.env.PGPORT),

    database: pgDb,

    user: process.env.POSTGRES_USER ?? <string>process.env.PGUSER,
    password: pgPass ?? <string>process.env.PGPASSWORD,

    statement_timeout: shortTimeout,
    query_timeout: shortTimeout,
    connectionTimeoutMillis: shortTimeout,
    idle_in_transaction_session_timeout: longTimeout,

    // pool-specific settings
    max: 16,
    idleTimeoutMillis: longTimeout,
    log: (msg) => {
      console.debug(`[pgPool]\t${msg}`);
    },
  };
};
