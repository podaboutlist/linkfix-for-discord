import dotenv from "dotenv";

import { initI18n } from "./i18n";
import { createCommands } from "./commands";
import { createClient } from "./client";

async function main(): Promise<void> {
  dotenv.config();

  const locale = process.env.LOCALE ?? "";
  await initI18n(locale);

  const commands = createCommands();
  const client = createClient(commands);

  await client.login(process.env.DISCORD_BOT_TOKEN);
}

main()
  .then()
  .catch((e) => {
    console.error(`An error occurred in main: ${e}`);
  });
