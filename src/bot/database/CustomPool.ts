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
      console.debug(`[pgPool]\t\t${msg}`);
    },
  };
};

const poolStats: (pool: Pool) => string = (pool) => {
  return (
    "[poolStats]\t\t" +
    `total: ${pool.totalCount}\t` +
    `idle: ${pool.idleCount}\t` +
    `waiting: ${pool.waitingCount}`
  );
};

/**
 * Create a Pool object with the application configuration and attach event handlers.
 * @returns Configured Pool object with attached event handlers.
 */
const CustomPool: () => Pool = () => {
  console.debug("[CustomPool]\t\tCreating a new connection pool.");

  const pool = new Pool(customPoolConfig());

  pool.on("connect", () => {
    // TODO: Figure out how to set/clear a timeout on checked out clients so we
    //       get an alert if client.release() isn't called.
    console.debug("[CustomPool]\t\tNew connection established.");
    console.debug(poolStats(pool));
  });

  pool.on("acquire", () => {
    console.debug("[CustomPool]\t\tClient checked out from pool");
    console.debug(poolStats(pool));
  });

  pool.on("error", (err) => {
    console.error(`[CustomPool]\t\tEncountered an error:\t${String(err)}`);
    console.debug(poolStats(pool));
  });

  pool.on("release", (err) => {
    // Workaround: @types/pg doesn't specify err can be Error | null | undefined
    console.debug(`[CustomPool]\t\tClient released back to pool:\t${String(err)}`);
    console.debug(poolStats(pool));
  });

  pool.on("remove", () => {
    console.debug("[CustomPool]\t\tClient closed and removed from pool");
    console.debug(poolStats(pool));
  });

  return pool;
};

export default CustomPool;
