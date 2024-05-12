import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import i18next from "i18next";

import { CustomCommand } from "../@types/CustomCommand";

const issuesLink = "https://github.com/podaboutlist/linkfix-for-discord/issues";

export function createHelpCommand(): CustomCommand {
  const description = i18next.t("command.help.description");
  const content = i18next.t("command.help.content", {
    issuesLink,
    // HACK: Disable escaping so the link is properly displayed, unencoded
    interpolation: {
      escapeValue: false,
    },
  });

  if (!description || !content) {
    console.error(`ERROR: Have you initialized i18n before calling this?`);
  }

  return {
    data: new SlashCommandBuilder().setName("help").setDescription(description),
    execute: async (interaction: CommandInteraction) => {
      await interaction.reply({
        content,
        ephemeral: true,
      });
    },
  };
}
