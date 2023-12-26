import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { CustomCommand } from "../@types/CustomCommand";

export const InviteCommand: CustomCommand = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Invite LinkFix to your server!"),
  execute: async (interaction: CommandInteraction) => {
    await interaction.reply({
      content:
        "You can use this link to add LinkFix to your server:\nhttps://discord.com/oauth2/authorize?client_id=385950397493280805&scope=bot&permissions=274878286912",
      ephemeral: true,
    });
  },
};
