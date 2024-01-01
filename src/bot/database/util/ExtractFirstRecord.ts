import { QueryResult } from "pg";

/**
 * Perform basic null checks on the results from a Postgres query
 * @param res Response object from a postgres query
 * @returns The first row if any data was returned, null otherwise
 */
const extractFirstRecord: (res: QueryResult) => object | null = (res) => {
  if (res.rowCount === null || res.rowCount < 1) {
    console.debug("[extractFirstRecord]\tres is null.");
    return null;
  }

  if (typeof res.rows[0] === "object") {
    console.debug("[extractFirstRecord]\tfound record in database.");
    return <object>res.rows[0];
  }

  return null;
};

export default extractFirstRecord;
