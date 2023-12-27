import dotenv from "dotenv";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { Commands } from "./commands";
import { replacements } from "./replacements";
import { CustomCommand } from "./@types/CustomCommand";
import fs from "node:fs";

dotenv.config();

const getDiscordToken: () => string = () => {
  if (process.env.DISCORD_BOT_TOKEN) {
    console.debug("[getDiscordToken]\tBot token found in environment.");
    return process.env.DISCORD_BOT_TOKEN;
  }

  if (process.env.DISCORD_BOT_TOKEN_FILE) {
    console.debug("[getDiscordToken]\tReading bot token from disk.");
    try {
      const token = fs.readFileSync(process.env.DISCORD_BOT_TOKEN_FILE, {
        encoding: "utf8",
      });
      return token.replaceAll(/\n/g, "");
    } catch (err) {
      throw Error(
        `Could not read contents of ${process.env.DISCORD_BOT_TOKEN_FILE}\n` +
          <string>err,
      );
    }
  }

  throw Error("DISCORD_BOT_TOKEN and DISCORD_BOT_TOKEN_FILE are both undefined.");
};

const replacementsEntries = Object.entries(replacements);

const client = new Client({
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
  client.user?.setActivity("/help");

  console.log(`[Events.ClientReady]\tLogged in as ${eventClient.user.tag}.`);

  const guildCount = eventClient.guilds.cache.size;
  console.log(
    `[Events.ClientReady]\tPresent in ${guildCount} ${
      guildCount === 1 ? "guild" : "guilds"
    }.`,
  );
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

void client.login(getDiscordToken());
