import { GuildRecord, SettingsRecord } from "../../@types/DatabaseRecords";
import { CustomCommand } from "../../@types/CustomCommand";
import { PoolClient } from "pg";
import { SlashCommandBuilder } from "discord.js";
import extractFirstRecord from "../../database/util/ExtractFirstRecord";

const findGuildRecord = "SELECT * FROM guilds WHERE native_guild_id = $1";
const insertGuildRecord =
  "INSERT INTO guilds(id, native_guild_id) VALUES(default,$1) RETURNING *";
const findSettingsRecord = "SELECT * FROM guild_settings WHERE guild = $1";
// after some googling it appears impossible to insert DEFAULT for a parameter
// in a query. brianc/node-postgres#1219
const insertDefaultSettings =
  "INSERT INTO guild_settings(" +
  "id, guild," +
  "suppress_embeds, delete_original_message, mention_user_in_reply," +
  "fix_instagram, fix_reddit, fix_tiktok, fix_twitter, fix_yt_shorts" +
  ") VALUES (" +
  "DEFAULT, $1," + // id, guild
  "DEFAULT, DEFAULT, DEFAULT," + // suppress_embeds, delete_original_message, mention_user_in_reply
  "DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT" + // fix_instagram, fix_reddit, fix_tiktok, fix_twitter, fix_yt_shorts
  ") RETURNING *";
// const insertSettingsRecord =
//   "INSERT INTO guild_settings(" +
//   "id, guild," +
//   "suppress_embeds, delete_original_message, mention_user_in_reply," +
//   "fix_instagram, fix_reddit, fix_tiktok, fix_twitter, fix_yt_shorts" +
//   ") VALUES (" +
//   "default, $1," + // id, guild
//   "$2, $3, $4," + // suppress_embeds, delete_original_message, mention_user_in_reply
//   "$5, $6, $7, $8, $9" + // fix_instagram, fix_reddit, fix_tiktok, fix_twitter, fix_yt_shorts
//   ") RETURNING *";

// todo: move this into src/bot/database
/**
 * Look up a guild's record in the database. Add it to the database if one doesn't exist
 * @param poolClient Checked out client from a pg pool
 * @param guildId The native discord ID of a guild (i.e. 643644919751376899)
 * @returns An opject representing the guild in the database.
 */
const getOrInsertGuildRecord: (
  poolClient: PoolClient,
  guildId: bigint,
) => Promise<GuildRecord> = async (poolClient, guildId) => {
  console.debug(`[getOrInsertGuildRecord] querying ${guildId} from database.`);

  let res = await poolClient.query(findGuildRecord, [guildId]);

  const record: object | null | GuildRecord = extractFirstRecord(res);

  if (record === null) {
    console.debug(
      `[getOrInsertGuildRecord] guild ${guildId} not found in database. Inserting...`,
    );
    res = await poolClient.query(insertGuildRecord, [guildId]);

    return <GuildRecord>res.rows[0];
  }

  // guild exists in database
  if (typeof record === "object") {
    console.debug(`[getOrInsertGuildRecord] guild ${guildId} found in database.`);
    return <GuildRecord>record;
  }

  // idk if we should actually do this but it seems logical
  poolClient.release();
  throw Error(`Unable to insert guild ${guildId} into database!`);
};

/**
 * Look up a guild's settings in the database. Insert them if the record doesn't exist.
 * @param poolClient Checked out client from a pg pool.
 * @param id The index of the record for the guild we're dealing with.
 * @returns An object represnting the settings for this guild in the database.
 */
const getOrInsertSettingsRecord: (
  poolClient: PoolClient,
  id: number,
) => Promise<SettingsRecord> = async (poolClient, id) => {
  let res = await poolClient.query(findSettingsRecord, [id]);

  const record: object | null | SettingsRecord = extractFirstRecord(res);

  console.debug(`[getOrInsertSettingsRecord] record is of type ${typeof record}`);

  if (record === null) {
    console.debug(
      "[getOrInsertSettingsRecord] " +
        `settings record related to guild with id ${id} not found in database. ` +
        "Inserting...",
    );
    // lol... ill fix this later...
    res = await poolClient.query(insertDefaultSettings, [id]);

    return <SettingsRecord>res.rows[0];
  }

  // guild exists in database
  if (typeof record === "object") {
    console.debug(
      "[getOrInsertSettingsRecord] " +
        `settings record related to guild with id ${id} found in database.`,
    );
    return <SettingsRecord>record;
  }

  // idk if we should actually do this but it seems logical
  poolClient.release();
  throw Error(`Unable to insert settings record for guild with id ${id} into database!`);
};

const commandData = new SlashCommandBuilder()
  .setName("configure")
  .addBooleanOption((option) =>
    option
      .setName("delete_on_reply")
      .setDescription("Should LinkFix delete messages when it replies to them?"),
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
  execute: async (i, pool) => {
    // FIXME: "Property 'getBoolean' does not exist on type 'Omit<CommandInteractionOptionResolver"
    //const deleteOnReply = i.options.get("delete_on_reply")?.value;

    if (typeof pool === "undefined") {
      await i.reply({
        content: "Error: database pool is undefined.",
        ephemeral: true,
      });
      return;
    }

    let guildId: string | bigint | null = i.guildId;

    if (guildId === null) {
      await i.reply({
        content: "Error: `interaction.guildId` is `null`.",
        ephemeral: true,
      });
      return;
    }

    console.debug("[ConfigureCommand] guildId is valid. checking database...");

    guildId = BigInt(guildId);

    const poolClient = await pool.connect();

    const guildRecord: GuildRecord = await getOrInsertGuildRecord(poolClient, guildId);

    console.debug(
      `[ConfigureCommand] looking up settings for guild with index ${guildRecord.id}`,
    );

    const settingsRecord: SettingsRecord = await getOrInsertSettingsRecord(
      poolClient,
      guildRecord.id,
    );

    console.debug(
      `[ConfigureCommand] Settings record found or inserted into the database: ${settingsRecord.id}`,
    );

    let responseMessage =
      "Your guild was found in the database:\n" +
      "```d\n" +
      `{ id: ${guildRecord.id}, native_guild_id: ${guildRecord.native_guild_id}}\n` +
      "```\n" +
      "Your guild's settings from the database:\n" +
      "```d\n{\n";

    for (const [k, v] of Object.entries(settingsRecord)) {
      responseMessage += `  ${k}: ${v}\n`;
    }

    responseMessage += "}\n```";

    await i.reply({
      content: responseMessage,
      ephemeral: false,
    });

    poolClient.release();

    return;
  },
};
