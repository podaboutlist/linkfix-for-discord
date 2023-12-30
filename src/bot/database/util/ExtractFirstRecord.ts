import { QueryResult } from "pg";

const extractFirstRecord: (res: QueryResult) => object | null = (res) => {
  if (res.rowCount === null || res.rowCount < 1) {
    console.debug("[extractFirstRecord] res is null.");
    return null;
  }

  if (typeof res.rows[0] === "object") {
    console.debug("[extractFirstRecord] found record in database.");
    return <object>res.rows[0];
  }

  return null;
};

export default extractFirstRecord;
