import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Pool } from "pg";

type CustomCommand = {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction, pool?: Pool) => Promise<void>;
};
