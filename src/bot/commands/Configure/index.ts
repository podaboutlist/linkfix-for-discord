import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { CustomCommand } from "../../@types/CustomCommand";

// TODO: Implement database logic and this command lol

const commandData = new SlashCommandBuilder()
  .setName("configure")
  .addBooleanOption((option) =>
    option
      .setName("delete-on-reply")
      .setDescription(
        "Should LinkFix delete messages when it replies to them?",
      ),
  )
  // run SetDescription last becasue add<>Option functions don't return a
  // SlashCommandBuilder
  .setDescription("Configure how LinkFix behaves in your server.");

export const ConfigureCommand: CustomCommand = {
  data: commandData,
  execute: async (interaction: CommandInteraction) => {
    await interaction.reply({
      content: "i am going to write a message here",
      ephemeral: true,
    });
  },
};
