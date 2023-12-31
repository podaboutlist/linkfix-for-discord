import * as db from "..";
import { GuildRecord, OptionalSettings, SettingsRecord } from "../../../@types/DatabaseRecords";
import { PoolClient, escapeIdentifier } from "pg";
import extractFirstRecord from "../util/ExtractFirstRecord";

const findQuery = "SELECT * FROM guild_settings WHERE guild = $1";

/**
 * If `/configure` is run without arguments in a guild we don't have in the
 * database, insert a settings record with all the default values.
 * @param client The client that will run the query
 * @param guild The target guild for inserting settings
 * @returns The new settings record for the guild (all default values)
 */
async function initializeSettings(
  client: PoolClient,
  guild: GuildRecord,
): Promise<SettingsRecord> {
  console.debug("[initializeSettings]\tInitializing settings for guild " + String(guild.id));

  // Defaults other than `guild` will be set by Postgres for us.
  const res = await client.query(
    "INSERT INTO guild_settings(guild) VALUES (" + guild.id + ") RETURNING *",
  );

  const settings = extractFirstRecord(res);

  if (settings === null) {
    const err = Error("Failed to initialize guild settings record!");

    client.release(err);

    throw err;
  }

  console.debug("[initializeSettings]\tSuccessfully initialized settings!");

  return <SettingsRecord>settings;
}

/**
 * Insert a settings record into the database. Used when the record doesn't
 * already exist.
 * @param client The client that will run the query
 * @param guild The target guild for inserting settings
 * @param settings An array of settings (optionally empty)
 * @returns The full settings of the guild.
 */
async function insertSettings(
  client: PoolClient,
  guild: GuildRecord,
  settings: OptionalSettings,
): Promise<SettingsRecord> {
  console.debug(`[insertSettings]\tInserting settings...`);

  const values: Array<boolean> = Object.values(settings);

  // I live in a nightmare world of my own creation.
  const keys: string = Object.keys(settings)
    .map((key) => {
      return escapeIdentifier(key);
    })
    .join(",");

  let queryString = "INSERT INTO guild_settings(guild," + keys + ") VALUES ($1,";

  for (let i = 0; i < values.length; ++i) {
    const twoBasedIndex = i + 2;

    queryString += "$" + String(twoBasedIndex);

    queryString += twoBasedIndex < values.length + 1 ? "," : "";
  }

  queryString += ") RETURNING *";

  console.debug(
    "[insertSettings]\tExecuting query " +
      queryString +
      " with values [" +
      [guild.id, ...values].join(", ") +
      "]",
  );

  const res = await client.query(queryString, [guild.id, ...values]);

  const newSettings = extractFirstRecord(res);

  if (newSettings === null) {
    const err = Error("Failed to insert guild settings record!");

    client.release(err);

    throw err;
  }

  console.debug("[insertSettings]\tSuccessfully inserted settings!");

  return <SettingsRecord>newSettings;
}

/**
 * Update settings for a guild we already have in our database.
 * @param client The client that will run the query
 * @param guild The target guild for inserting settings
 * @param settings An array of settings (optionally empty)
 * @returns The full settings of the guild.
 */
async function updateSettings(
  client: PoolClient,
  guild: GuildRecord,
  settings: OptionalSettings,
): Promise<SettingsRecord> {
  const keys = Object.keys(settings);
  const values: Array<boolean> = Object.values(settings);

  console.debug(
    "[updateSettings]\t\tPreparing to update settings\tKeys: " +
      String(keys) +
      "\tValues: " +
      String(values),
  );

  /**
   * UPDATE guild_settings
   *  SET col_1 = val_1,
   *      col_2 = val_2,
   *      ...
   * WHERE guild = guild.id;
   */

  let queryString = "UPDATE guild_settings SET ";

  // col_1 = $1
  keys.forEach((key, i) => {
    const oneBasedIndex = i + 1;

    // add ANOTHER one because $1 is our guild ID
    queryString += escapeIdentifier(key) + " = $" + String(oneBasedIndex + 1);

    // add a comma after every a = b except the last set
    queryString += oneBasedIndex < keys.length ? ", " : " ";
  });

  queryString += "WHERE guild = $1 RETURNING *";

  console.debug(
    "[updateSettings]\t\tUpdating guild settings:\t" +
      queryString +
      `[${guild.id}, ${String(values)}]`,
  );

  const res = await client.query(queryString, [guild.id, ...values]);

  const newSettings = extractFirstRecord(res);

  if (newSettings === null) {
    const err = Error("Failed to update guild settings record!");

    client.release(err);

    throw err;
  }

  console.debug("[updateSettings]\t\tSuccessfully updated settings!");

  return <SettingsRecord>newSettings;
}

/**
 * Get the settings of a guild without modifying them.
 * @param guild The guild whose settings we want to fetch
 * @returns The settings for that guild
 */
export async function getSettings(guild: GuildRecord): Promise<SettingsRecord> {
  console.debug(
    "[getSettings]\t\tFetching settings for " + `{${guild.id}, ${guild.native_guild_id}}`,
  );

  const client = await db.getClient();

  let record = extractFirstRecord(await client.query(findQuery, [guild.id]));

  if (record === null) {
    console.debug("[getSettings]\t\tInitializing settings for guild " + String(guild.id));
    record = initializeSettings(client, guild);
  }

  client.release();

  return <SettingsRecord>record;
}

/**
 * Set one or more settings for a guild.
 * @param guild The guild whose settings we want to update
 * @param settings The new settings for the guild
 */
export async function setSettings(
  guild: GuildRecord,
  newSettings: OptionalSettings,
): Promise<SettingsRecord> {
  console.debug(
    "[setSettings]\t\tSetting settings for " + `{${guild.id}, ${guild.native_guild_id}}`,
  );

  const client = await db.getClient();

  // check to see if the settings record already exists. INSERT if not,
  // UPDATE if it does.
  let record = extractFirstRecord(await client.query(findQuery, [guild.id]));

  if (record === null) {
    console.debug("[setSettings]\t\tInserting settings for " + String(guild.id));
    record = await insertSettings(client, guild, newSettings);
  } else {
    console.debug("[setSettings]\t\tUpdating settings for " + String(guild.id));
    record = await updateSettings(client, guild, newSettings);
  }

  client.release();

  return <SettingsRecord>record;
}
