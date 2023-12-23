import dotenv from "dotenv";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { Commands } from "./commands";
import { replacements } from "./replacements";
import { CustomCommand } from "./@types/CustomCommand";

/* eslint-disable-next-line
  @typescript-eslint/no-unsafe-call,
  @typescript-eslint/no-unsafe-member-access --
  HACK: Can't figure out how to squash these eslint errors lol
*/
dotenv.config();

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

  console.log(`Ready! Logged in as ${eventClient.user.tag}.`);

  const guildCount = eventClient.guilds.cache.size;
  console.log(
    `Present in ${guildCount} ${guildCount === 1 ? "guild" : "guilds"}.`,
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
  if (message.author.bot) {
    // Avoid infinite loop by replying to self, or another bot that would reply to me
    return;
  }

  let reply = "";
  for (const [identifier, replacer] of replacementsEntries) {
    if (message.content.includes(identifier)) {
      const result = replacer(message.content);

      if (result) {
        reply += result + "\n";
      }
    }
  }

  if (reply === "") {
    return;
  }

  message
    .reply({ content: reply, allowedMentions: { repliedUser: false } })
    .catch((err) => {
      const errMsg: string = (err as Error).message;

      if (errMsg.includes("Missing Permissions")) {
        return;
      }

      console.error("> Failed to reply: ", (err as Error).message);
    });
});

void client.login(process.env.DISCORD_BOT_TOKEN);
