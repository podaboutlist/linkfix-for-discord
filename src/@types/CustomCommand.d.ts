import { CommandInteraction, SlashCommandBuilder } from "discord.js";

type CustomCommand = {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
};
