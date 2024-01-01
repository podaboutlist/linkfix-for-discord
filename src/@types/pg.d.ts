// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as pg from "pg";

// @types/pg doesn't include these defenitions /shrug
declare module "pg" {
  /**
   * Escapes a string as a SQL identifier.
   * @param str The string to escape.
   * @returns A token that has a fixed meaning in the SQL language.
   */
  export function escapeIdentifier(str: string): string;

  /**
   * Escapes a string as a SQL literal.
   * @param str The string to escape.
   * @returns A string representing a PostgreSQL string constant.
   */
  export function escapeLiteral(str: string): string;
}
