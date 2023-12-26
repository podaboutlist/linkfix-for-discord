import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { CustomCommand } from "../@types/CustomCommand";

export const HelpCommand: CustomCommand = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get a helpful message from LinkFix!"),
  execute: async (interaction: CommandInteraction) => {
    await interaction.reply({
      content:
        "LinkFix works automagically! Just invite the bot to your server, make sure it has permission to read and send messages, and it will automatically respond with fixed links for you!\n\n__Available Commands__\n- `/invite`: Get a URL to invite LinkFix to your server.\n- `/vote`: If you enjoy LinkFix, please consider voting for the bot on Top.gg! :grinning:\n- `/help`: This is the one you're looking at right now!\n\nIf you are having trouble with the bot, please open an issue here: https://github.com/podaboutlist/linkfix-for-discord/issues",
      ephemeral: true,
    });
  },
};
