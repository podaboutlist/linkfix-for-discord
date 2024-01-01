import { CommandInteraction, SlashCommandBuilder } from "discord.js";

import { CustomCommand } from "../../@types/CustomCommand";

export const commandData = new SlashCommandBuilder()
  .setName("invite")
  .setDescription("Invite LinkFix to your server!");

export const InviteCommand: CustomCommand = {
  data: commandData,
  execute: async (interaction: CommandInteraction) => {
    await interaction.reply({
      content:
        "You can use this link to add LinkFix to your server:\nhttps://discord.com/oauth2/authorize?client_id=385950397493280805&scope=bot%20applications.commands&permissions=274877934592",
      ephemeral: true,
    });
  },
};
