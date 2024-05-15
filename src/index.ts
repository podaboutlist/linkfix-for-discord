import dotenv from "dotenv";

import { error, initLogger, loggerAvailable } from "./logging";
import { initI18n } from "./i18n";
import { createCommands } from "./commands";
import { createClient } from "./client";
import { getEnvironmentMode } from "./environment";

async function main(): Promise<void> {
  dotenv.config();

  const environmentMode = getEnvironmentMode();
  initLogger(environmentMode, "bot");

  const locale = process.env.LOCALE ?? "";
  await initI18n(locale);

  const commands = createCommands();
  const client = createClient(commands);

  await client.login(process.env.DISCORD_BOT_TOKEN);
}

main()
  .then()
  .catch((e: Error) => {
    if (loggerAvailable()) {
      // TODO: Refactor `error()` parameters to accept an `Error` object
      error(`Exception thrown from main:\n ${e.name}: ${e.message}!`);
      return;
    }

    console.error(`Exception thrown from main:\n ${e.name}: ${e.message}!`);
  });
