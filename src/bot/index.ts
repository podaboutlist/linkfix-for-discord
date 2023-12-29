import { Collection, Client as DiscordClient, Events, GatewayIntentBits } from "discord.js";
import { Commands } from "./commands";
import { CustomCommand } from "./@types/CustomCommand";
import { CustomPool } from "./database";
import dotenv from "dotenv";
import getFromEnvOrFile from "../lib/GetFromEnvOrFile";
import { replacements } from "./replacements";

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

/*
  Events.ClientReady gets fired when the bot fully authenticates after it first
  starts up. We perform our initial logic (database pool initialization, etc.)
  when this event is fired.
*/
client.once(Events.ClientReady, async (eventClient) => {
  console.log(`[Events.ClientReady]\tLogged in as ${eventClient.user.tag}.`);

  const guildCount = eventClient.guilds.cache.size;
  console.log(
    `[Events.ClientReady]\tPresent in ${guildCount} ${guildCount === 1 ? "guild" : "guilds"}.`,
  );

  console.debug("[Events.ClientReady] Initializing Postgres connection pool...");

  client.pgPool = CustomPool();

  console.debug("[Events.ClientReady] Postgres connection pool established.");

  // TODO: Remove this query. Just a sanity check for now :)
  const res = await client.pgPool.query("SELECT * FROM guilds LIMIT 1");

  if (res.rowCount === null || res.rowCount < 1) {
    console.debug("[Events.ClientReady] Database appears to be empty.");
  } else {
    const row = <{ id: number; native_guild_id: string }>res.rows[0];

    console.debug(
      `[Events.ClientReady] SELECT * FROM guilds LIMIT 1: { id: ${row.id}, native_guild_id: ${row.native_guild_id} }`,
    );
  }

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

/*
  Events.InteractionCreate fires whenever someone uses one of our slash, a.k.a.
  application commands.

  I initially thought we could persist the pgPool object on the client but it
  appears that is not possible. Instead, we pass a reference to the pool as an
  optional argument to the callback function.
*/
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = <CustomCommand>interaction.client.commands.get(interaction.commandName);

  await command.execute(interaction, client.pgPool);
});

/*
  Events.MessageCreate is fired whenever someone posts a message to any channel
  we have permission to view. This is where the actual "link fixing" happens
  since we want the functionality to work passively instead of with a command.
*/
client.on(Events.MessageCreate, (message) => {
  // Avoid infinite loops of bots replying to each other
  if (message.author.bot) {
    return;
  }

  let reply = "";

  for (const [identifier, replacer] of replacementsEntries) {
    // no "g" flag because we only need to know if there's one or zero matches
    const regex = RegExp(identifier);

    if (regex.test(message.content)) {
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

      console.error("[Events.MessageCreate]\tFailed to reply\t", (err as Error).message);
    });
});

void client.login(getFromEnvOrFile("DISCORD_BOT_TOKEN"));
