import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";
import getFromEnvOrFile from "../../lib/GetFromEnvOrFile";

dotenv.config();

// TODO: See if we need to tweak this timeout value.
const shortTimeout = 2 * 1000;
const longTimeout = 30 * 1000;

const inDocker = process.env.RUNNING_IN_DOCKER;

/**
 * Try to figure out what the database name is given all the possible environment
 * variables that could store it.
 * @returns Calculated database name
 */
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

/**
 * Create an application-specific configuration object for LinkFix
 * @returns Instantiated configuration object.
 */
const customPoolConfig: () => PoolConfig = () => {
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

/**
 * Create a Pool object with the application configuration and attach event handlers.
 * @returns Configured Pool object with attached event handlers.
 */
const CustomPool: () => Pool = () => {
  const pool = new Pool(customPoolConfig());

  pool.on("connect", () => {
    console.debug("[CustomPool]\tNew connection established");
  });

  pool.on("acquire", () => {
    console.debug("[CustomPool]\tClient checked out from pool");
  });

  pool.on("error", (err) => {
    console.error(`[CustomPool]\tEncountered an error:\t${err.message}`);
  });

  pool.on("release", (err) => {
    console.error(`[CustomPool]\tClient released back to pool:\t${err.message}`);
  });

  pool.on("remove", () => {
    console.debug("[CustomPool]\tClient closed and removed from pool");
  });

  return pool;
};

export default CustomPool;
