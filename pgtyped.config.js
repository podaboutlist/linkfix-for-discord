const dotenv = require("dotenv");
const fs = require("node:fs");

dotenv.config();

let pgPass;

try {
  pgPass = fs.readFileSync("./secrets/postgres-password.txt", { encoding: "utf8" });
} catch (err) {
  console.error("Could not read Postgres password from file.");
}

pgPass = pgPass.replace(/\n/g, "");

const config = {
  transforms: [
    {
      mode: "sql",
      include: "**/*.sql",
      emitTemplate: "{{dir}}/{{name}}.queries.mts",
    },
    {
      mode: "ts",
      include: "**/action.ts",
      emitTemplate: "{{dir}}/{{name}}.types.mts",
    },
  ],
  srcDir: "./src/bot/",
  failOnError: false,
  camelCaseColumnNames: false,
  // PostgreSQL environment variables will override these settings
  // https://pgtyped.dev/docs/cli#environment-variables
  // Use `docker compose up -d postgres` to run the database in the background
  db: {
    dbName: "linkfix",
    user: "linkfix",
    password: pgPass ? pgPass : "linkfix",
    host: "127.0.0.1",
    port: 15432,
    ssl: false,
  },
};

module.exports = config;
