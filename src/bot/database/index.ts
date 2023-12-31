// Parts of this file are adapted from https://node-postgres.com/guides/project-structure

import { QueryConfig, QueryResult } from "pg";
import CustomPool from "./CustomPool";

// FIXME: This creates a database pool when we run AppCommandsCLI
const pool = CustomPool();

/**
 * Easily execute a single query without checking a client out of the pool.
 * @param queryString Optionally parameterized SQL query string
 * @param values Array of values to pass into query parameters
 * @returns The result of the query
 */
export const query: (
  query: string | QueryConfig,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any --
   * Parent library uses type `any` so we should use it here too.
   **/
  values?: any[],
) => Promise<QueryResult> = async (queryString, values?) => {
  const start = Date.now();
  const res = await pool.query(queryString, values);
  const duration = Date.now() - start;

  console.debug("[CustomPool.query]\texecuted query", {
    queryString,
    duration,
    rows: res.rowCount,
  });

  return res;
};

/**
 * Check a client out from our pool. Make sure to call client.release() when
 * you're done!
 * @returns A new client from the connection pool
 */
export const getClient = () => {
  // TODO: Implement logic to check for clients not released back to the pool.
  return pool.connect();
};

/**
 * Shut down all our clients and close the pool. Should only be called on
 * sutdown.
 */
export const end = async () => {
  await pool.end();
};
