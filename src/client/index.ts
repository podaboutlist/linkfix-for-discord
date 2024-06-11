import { Client, Collection, Events, GatewayIntentBits } from "discord.js";

import { CustomCommand } from "../@types/CustomCommand";
import { replacements } from "../replacements";
import { error, info } from "../logging";

export function createClient(commands: CustomCommand[]): Client {
  const replacementsEntries = Object.entries(replacements);

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.commands = new Collection<string, CustomCommand>();

  for (const cmd of commands) {
    client.commands.set(cmd.data.name, cmd);
  }

  client.once(Events.ClientReady, (eventClient) => {
    client.user?.setActivity("/help");

    info(`Logged in as ${eventClient.user.tag}`, "Events.ClientReady");

    const guildCount = eventClient.guilds.cache.size;
    info(
      `Present in ${guildCount} ${guildCount === 1 ? "guild" : "guilds"}`,
      "Events.ClientReady",
    );
  });

  client.on(Events.InteractionCreate, (interaction) => {
    // This is ugly as hell but it fixes our issue with eslint! :)
    void (async () => {
      if (!interaction.isChatInputCommand()) return;

      const command = <CustomCommand>interaction.client.commands.get(interaction.commandName);
      await command.execute(interaction);
    })();
  });

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

          error(`Failed to suppress embeds: ${(err as Error).message}`, "Events.MessageCreate");
        });
      })
      .catch((err) => {
        const errMsg: string = (err as Error).message;

        if (errMsg.includes("Missing Permissions")) {
          return;
        }

        error(`Failed to reply: ${(err as Error).message}`, "Events.MessageCreate");
      });
  });

  return client;
}
