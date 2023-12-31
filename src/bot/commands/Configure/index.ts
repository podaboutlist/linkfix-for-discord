import { GuildRecord, OptionalSettings, SettingsRecord } from "../../../@types/DatabaseRecords";
import { getSettings, setSettings } from "../../database/queries/Settings";
import { CustomCommand } from "../../../@types/CustomCommand";
import { SlashCommandBuilder } from "discord.js";
import { getGuildRecord } from "../../database/queries/Guilds";

export const commandData = new SlashCommandBuilder()
  .setName("configure")
  .addBooleanOption((option) =>
    option
      .setName("suppress_embeds")
      .setDescription("Should linkfix remove embeds from messages it replies to?"),
  )
  .addBooleanOption((option) =>
    option
      .setName("delete_on_reply")
      .setDescription("Should LinkFix delete messages it replies to??"),
  )
  .addBooleanOption((option) =>
    option
      .setName("mention_user")
      .setDescription("Mention the user LinkFix is replying to (when deleting a message)."),
  )
  .addBooleanOption((option) =>
    option.setName("fix_instagram").setDescription("Enable/disable fixing of Instagram URLs."),
  )
  .addBooleanOption((option) =>
    option.setName("fix_reddit").setDescription("Enable/disable fixing of Reddit URLs."),
  )
  .addBooleanOption((option) =>
    option.setName("fix_tiktok").setDescription("Enable/disable fixing of TikTok URLs."),
  )
  .addBooleanOption((option) =>
    option.setName("fix_twitter").setDescription("Enable/disable fixing of Twitter/X URLs."),
  )
  .addBooleanOption((option) =>
    option
      .setName("fix_youtube")
      .setDescription("Enable/disable fixing of YouTube Shorts URLs."),
  )
  // run SetDescription last becasue add...Option functions don't return a
  // SlashCommandBuilder
  .setDescription("Configure how LinkFix behaves in your server.");

export const ConfigureCommand: CustomCommand = {
  data: commandData,
  execute: async (i) => {
    // FIXME: "Property 'getBoolean' does not exist on type 'Omit<CommandInteractionOptionResolver"
    //i.options.getBoolean("delete_on_reply")

    const userOptions: OptionalSettings = {};
    let updateSettings = false;

    // TODO: Figure out a way to iterate over all our top-level options
    if (i.options.get("suppress_embeds")) {
      userOptions.suppress_embeds = <boolean>i.options.get("suppress_embeds")?.value;
      updateSettings = true;
    }
    if (i.options.get("delete_on_reply")) {
      userOptions.delete_original_message = <boolean>i.options.get("delete_on_reply")?.value;
      updateSettings = true;
    }
    if (i.options.get("mention_user")) {
      userOptions.mention_user_in_reply = <boolean>i.options.get("mention_user")?.value;
      updateSettings = true;
    }
    if (i.options.get("fix_instagram")) {
      userOptions.fix_instagram = <boolean>i.options.get("fix_instagram")?.value;
      updateSettings = true;
    }
    if (i.options.get("fix_reddit")) {
      userOptions.fix_reddit = <boolean>i.options.get("fix_reddit")?.value;
      updateSettings = true;
    }
    if (i.options.get("fix_tiktok")) {
      userOptions.fix_tiktok = <boolean>i.options.get("fix_tiktok")?.value;
      updateSettings = true;
    }
    if (i.options.get("fix_twitter")) {
      userOptions.fix_twitter = <boolean>i.options.get("fix_twitter")?.value;
      updateSettings = true;
    }
    if (i.options.get("fix_youtube")) {
      userOptions.fix_yt_shorts = <boolean>i.options.get("fix_youtube")?.value;
      updateSettings = true;
    }

    let guildId: string | bigint | null = i.guildId;

    if (guildId === null) {
      await i.reply({
        content: "Error: `interaction.guildId` is `null`.",
        ephemeral: true,
      });
      return;
    }

    console.debug("[ConfigureCommand]\tguildId is valid. checking database...");

    guildId = BigInt(guildId);

    const guildRecord: GuildRecord = await getGuildRecord(guildId);

    console.debug(
      `[ConfigureCommand]\tlooking up settings for guild with index ${guildRecord.id}`,
    );

    let settingsRecord: SettingsRecord;

    if (updateSettings) {
      settingsRecord = await setSettings(guildRecord, userOptions);
    } else {
      settingsRecord = await getSettings(guildRecord);
    }

    console.debug(
      `[ConfigureCommand]\tSettings record found or inserted into the database: ${settingsRecord.id}`,
    );

    let responseMessage =
      "Your guild was found in the database:\n" +
      "```d\n" +
      `{ id: ${guildRecord.id}, native_guild_id: ${guildRecord.native_guild_id}}\n` +
      "```\n" +
      `Your guild's settings were ${updateSettings ? "updated" : "found"} in the database:\n` +
      "```d\n{\n";

    for (const [k, v] of Object.entries(settingsRecord)) {
      responseMessage += `  ${k}: ${v}\n`;
    }

    responseMessage += "}\n```";

    await i.reply({
      content: responseMessage,
      ephemeral: false,
    });

    return;
  },
};
