import dotenv from "dotenv";
// import pg from "pg";
import { Pool as PgPool } from "pg";
import {
  Client as DiscordClient,
  Collection,
  Events,
  GatewayIntentBits,
} from "discord.js";
import { pgPoolConfig } from "./database";
import { Commands } from "./commands";
import { replacements } from "./replacements";
import { CustomCommand } from "./@types/CustomCommand";
import getFromEnvOrFile from "../lib/GetFromEnvOrFile";

dotenv.config();

const replacementsEntries = Object.entries(replacements);

const client = new DiscordClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection<string, CustomCommand>();

for (const cmd of Commands) {
  client.commands.set(cmd.data.name, cmd);
}

client.once(Events.ClientReady, (eventClient) => {
  console.log(`[Events.ClientReady]\tLogged in as ${eventClient.user.tag}.`);

  const guildCount = eventClient.guilds.cache.size;
  console.log(
    `[Events.ClientReady]\tPresent in ${guildCount} ${
      guildCount === 1 ? "guild" : "guilds"
    }.`,
  );

  console.debug("[Events.ClientReady] Initializing Postgres connection pool...");

  client.pgPool = new PgPool(pgPoolConfig());

  console.debug("[Events.ClientReady] Postgres connection pool established.");

  client.user?.setActivity("/help");
});

/*
  Trap Ctrl+C and perform a graceful shutdown.
  TODO: Break this out into its own file and handle other process term codes.
        Right now this only supports SIGTERM from *nix Ctrl+C and Docker.
*/
process.once("SIGTERM", () => {
  console.log("[process]\tSIGTERM\tShutting down...");
  void client.pgPool
    .end()
    .then(
      () => {
        console.log("[process]\tSIGTERM\tDatabase connection closed.");
      },
      (rej) => {
        console.log("[process]\tSIGTERM\tIt- it's not shutting down!\n" + <string>rej);
      },
    )
    .finally(() => {
      console.log("[process]\tSIGTERM\tAll done. Goodbye!");
      process.exit(0);
    });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = <CustomCommand>(
    interaction.client.commands.get(interaction.commandName)
  );
  await command.execute(interaction);
});

client.on(Events.MessageCreate, (message) => {
  // Avoid infinite loops of bots replying to each other
  if (message.author.bot) {
    return;
  }

  let reply = "";

  for (const [identifier, replacer] of replacementsEntries) {
    if (message.content.includes(identifier)) {
      // bit ugly but easiest way to get rid of || at the end of spoilered links
      // plus, what's the worst thing that could happen? what kind of URL has
      // "|" in it?    👈 me settin myself up lol
      const result = replacer(message.content.replaceAll("|", ""));

      if (result) {
        reply += result + "\n";
      }
    }
  }

  if (reply === "") {
    return;
  }

  if (message.content.includes("||")) {
    // Spoiler the message with some padding so the vertical bars don't mess
    // up the end of the URLs
    reply = "||" + reply.replace(/\n$/g, "") + " ||";
  }

  message
    .reply({ content: reply, allowedMentions: { repliedUser: false } })
    .then(() => {
      message.suppressEmbeds(true).catch((err) => {
        const errMsg: string = (err as Error).message;

        if (errMsg.includes("Missing Permissions")) {
          return;
        }

        console.error(
          "[Events.MessageCreate]\tFailed to suppress embeds\t",
          (err as Error).message,
        );
      });
    })
    .catch((err) => {
      const errMsg: string = (err as Error).message;

      if (errMsg.includes("Missing Permissions")) {
        return;
      }

      console.error(
        "[Events.MessageCreate]\tFailed to reply\t",
        (err as Error).message,
      );
    });
});

void client.login(getFromEnvOrFile("DISCORD_BOT_TOKEN"));
