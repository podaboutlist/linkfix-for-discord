import { PoolConfig } from "pg";
import getFromEnvOrFile from "../../lib/GetFromEnvOrFile";

// TODO: See if we need to tweak this timeout value.
const timeoutMs = 2000;

const inDocker = process.env.RUNNING_IN_DOCKER;

// TODO: Fix this so it uses Postgres environment variables like PGHOST if they
//       are present. https://www.postgresql.org/docs/9.1/libpq-envars.html
export const pgPoolConfig: () => PoolConfig = () => {
  let pgPass: string | undefined;

  try {
    pgPass = getFromEnvOrFile("POSTGRES_PASSWORD");
  } catch (err) {
    pgPass = undefined;
  }

  return {
    host: inDocker ? "postgres.docker" : "127.0.0.1",
    port: inDocker ? 5432 : 15432,
    application_name: "linkfix",
    database: "linkfix",
    user: process.env.POSTGRES_USER ?? "linkfix",
    password: pgPass ?? "linkfix",
    statement_timeout: timeoutMs,
    query_timeout: timeoutMs,
    connectionTimeoutMillis: timeoutMs,
    // might wanna change this one in the future...
    idle_in_transaction_session_timeout: timeoutMs,

    // pool-specific settings
    max: 16,
    idleTimeoutMillis: 30 * 1000,
  };
};
