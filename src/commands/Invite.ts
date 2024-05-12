import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import i18next from "i18next";

import { CustomCommand } from "../@types/CustomCommand";

const inviteLink =
  "https://discord.com/oauth2/authorize?client_id=385950397493280805&scope=bot%20applications.commands&permissions=274877934592";

export function createInviteCommand(): CustomCommand {
  const description = i18next.t("command.invite.description");
  const content = i18next.t("command.invite.content", {
    inviteLink,
    // HACK: Disable escaping so the link is properly displayed, unencoded
    interpolation: {
      escapeValue: false,
    },
  });

  if (!description || !content) {
    console.error(`ERROR: Have you initialized i18n before calling this?`);
  }

  return {
    data: new SlashCommandBuilder().setName("invite").setDescription(description),
    execute: async (interaction: CommandInteraction) => {
      await interaction.reply({
        content,
        ephemeral: true,
      });
    },
  };
}
