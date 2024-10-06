import dotenv from "dotenv";

import { info, initLogger } from "./logging";
import { getEnvironmentMode } from "./environment";

import { ShardingManager } from "discord.js";

dotenv.config();

const manager = new ShardingManager("./dist/client/index.js", {
  token: process.env.DISCORD_BOT_TOKEN,
});

const environmentMode = getEnvironmentMode();
initLogger(environmentMode, "bot");

manager.on("shardCreate", (shard) => {
  info(`Launched shard ${shard.id}`);
});

void manager.spawn();
