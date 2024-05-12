import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import i18next from "i18next";

import { CustomCommand } from "../@types/CustomCommand";

export function createVoteCommand(): CustomCommand {
  const description = i18next.t("command.vote.description");
  const content = i18next.t("command.vote.content", {
    voteLink: "https://top.gg/bot/385950397493280805/vote",
    // HACK: Disable escaping so the link is properly displayed, unencoded
    interpolation: {
      escapeValue: false,
    },
  });

  if (!description || !content) {
    console.error(`ERROR: Have you initialized i18n before calling this?`);
  }

  return {
    data: new SlashCommandBuilder().setName("vote").setDescription(description),
    execute: async (interaction: CommandInteraction) => {
      await interaction.reply({
        content,
        ephemeral: true,
      });
    },
  };
}
