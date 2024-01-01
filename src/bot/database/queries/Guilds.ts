import * as db from "..";
import { GuildRecord } from "../../../@types/DatabaseRecords";
import extractFirstRecord from "../util/ExtractFirstRecord";

const findQuery = "SELECT * FROM guilds WHERE native_guild_id = $1";

const insertQuery = "INSERT INTO guilds(id, native_guild_id) VALUES(default,$1) RETURNING *";

/**
 * Gets a guild from the database. Mainly so we can find the index and look up
 * the associated settings record.
 * @param guildId Guild ID from Discord, i.e. 643644919751376899
 * @returns The guild's record in our database
 */
export const getGuildRecord: (guildId: bigint | string) => Promise<GuildRecord> = async (
  guildId,
) => {
  const client = await db.getClient();

  let record = extractFirstRecord(await client.query(findQuery, [guildId]));

  if (record === null) {
    record = extractFirstRecord(await client.query(insertQuery, [guildId]));
  }

  client.release();

  return <GuildRecord>record;
};
